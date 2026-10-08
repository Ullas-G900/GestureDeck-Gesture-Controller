import type { IncomingMessage, Server } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocket, WebSocketServer } from "ws";
import { logger } from "./logger";

type Role = "controller" | "device";
type RelayPeer = { channel: string; role: Role; socket: WebSocket };
type JsonObject = Record<string, unknown>;

const CHANNEL_PATTERN = /^[a-f0-9]{32}$/;
const MAX_CLIENTS = 250;
const MAX_MESSAGES_PER_SECOND = 50;
const ALLOWED_COMMANDS = new Set([
  "Pause",
  "Play",
  "Previous",
  "Next",
  "Stop",
  "Volume up",
  "Volume down",
  "Mute",
  "Seek",
  "Rotate",
  "Start",
  "Exit fullscreen",
]);

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sendJson(socket: WebSocket, value: JsonObject): void {
  if (socket.readyState !== WebSocket.OPEN || socket.bufferedAmount > 32_768) {
    return;
  }
  socket.send(JSON.stringify(value));
}

function deviceCount(peers: Set<RelayPeer>, channel: string): number {
  let count = 0;
  for (const peer of peers) {
    if (
      peer.channel === channel &&
      peer.role === "device" &&
      peer.socket.readyState === WebSocket.OPEN
    ) {
      count += 1;
    }
  }
  return count;
}

function publishDeviceCount(peers: Set<RelayPeer>, channel: string): void {
  const status = { type: "status", devices: deviceCount(peers, channel) };
  for (const peer of peers) {
    if (peer.channel === channel && peer.role === "controller") {
      sendJson(peer.socket, status);
    }
  }
}

function rejectUpgrade(socket: Duplex, status: number): void {
  const reason = status === 503 ? "Service Unavailable" : "Bad Request";
  socket.end(`HTTP/1.1 ${status} ${reason}\r\nConnection: close\r\n\r\n`);
}

function parsePacket(data: Buffer | ArrayBuffer | Buffer[]): unknown {
  const text = Array.isArray(data)
    ? Buffer.concat(data).toString("utf8")
    : Buffer.isBuffer(data)
      ? data.toString("utf8")
      : Buffer.from(data).toString("utf8");
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function forwardCommand(
  peers: Set<RelayPeer>,
  channel: string,
  value: unknown,
): void {
  if (!isObject(value) || value.type !== "command") return;
  if (typeof value.command !== "string" || !ALLOWED_COMMANDS.has(value.command)) {
    return;
  }

  const message = {
    type: "command",
    command: value.command,
    gesture:
      typeof value.gesture === "string" ? value.gesture.slice(0, 64) : "Unknown",
    confidence:
      typeof value.confidence === "number" && Number.isFinite(value.confidence)
        ? Math.max(0, Math.min(1, value.confidence))
        : 0,
    at: Date.now(),
  };

  for (const peer of peers) {
    if (peer.channel === channel && peer.role === "device") {
      sendJson(peer.socket, message);
    }
  }
}

export function attachGestureRelay(server: Server): void {
  const webSockets = new WebSocketServer({
    noServer: true,
    maxPayload: 4_096,
    perMessageDeflate: false,
  });
  const peers = new Set<RelayPeer>();

  server.on("upgrade", (request: IncomingMessage, socket, head) => {
    let url: URL;
    try {
      url = new URL(request.url ?? "/", "http://localhost");
    } catch {
      rejectUpgrade(socket, 400);
      return;
    }

    if (url.pathname !== "/api/ws") {
      rejectUpgrade(socket, 400);
      return;
    }

    const channel = url.searchParams.get("channel") ?? "";
    const role = url.searchParams.get("role");
    if (
      !CHANNEL_PATTERN.test(channel) ||
      (role !== "controller" && role !== "device")
    ) {
      rejectUpgrade(socket, 400);
      return;
    }
    if (peers.size >= MAX_CLIENTS) {
      rejectUpgrade(socket, 503);
      return;
    }

    webSockets.handleUpgrade(request, socket, head, (clientSocket) => {
      const peer: RelayPeer = { channel, role, socket: clientSocket };
      peers.add(peer);
      sendJson(clientSocket, { type: "ready", role });
      if (role === "controller") {
        sendJson(clientSocket, {
          type: "status",
          devices: deviceCount(peers, channel),
        });
      } else {
        publishDeviceCount(peers, channel);
      }

      let intervalStart = Date.now();
      let messagesInInterval = 0;
      clientSocket.on("message", (data, isBinary) => {
        if (isBinary) {
          clientSocket.close(1003, "Text messages only");
          return;
        }
        const now = Date.now();
        if (now - intervalStart >= 1_000) {
          intervalStart = now;
          messagesInInterval = 0;
        }
        messagesInInterval += 1;
        if (messagesInInterval > MAX_MESSAGES_PER_SECOND) {
          clientSocket.close(1008, "Rate limit exceeded");
          return;
        }
        if (peer.role === "controller") {
          forwardCommand(peers, peer.channel, parsePacket(data));
        }
      });

      clientSocket.on("close", () => {
        peers.delete(peer);
        if (peer.role === "device") publishDeviceCount(peers, peer.channel);
      });
      clientSocket.on("error", (error) => {
        logger.debug({ error, role }, "Gesture relay socket error");
      });
    });
  });
}
