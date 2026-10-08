# GestureDeck

Touch-free hand gesture control for a browser-based demo. GestureDeck uses MediaPipe Hands locally in the browser, then routes recognized input through one command bus to a generated-tone player, a six-slide presentation, practice mode, virtual devices, or an optional WebSocket relay.

## Setup

From this package directory:

```sh
pnpm install
pnpm dev
```

Vite expects the workspace `PORT` and `BASE_PATH` environment variables used by the supplied project configuration. For a local run, provide values such as `PORT=5173 BASE_PATH=/ pnpm dev`. Camera permission requires HTTPS or `localhost`; click **Start camera** to request permission. The app loads `@mediapipe/tasks-vision` and `hand_landmarker.task` from the official jsDelivr and Google MediaPipe CDNs. It tries GPU inference first and falls back to CPU.

Build and check:

```sh
pnpm typecheck
pnpm test
pnpm build
```

## Gesture cheat sheet

| Gesture | Default action |
| --- | --- |
| Open Palm | Pause |
| Thumbs Up | Play |
| Point Left | Previous |
| Point Right | Next |
| Closed Fist | Stop |
| Victory | Volume up |
| Swipe Left / Right | Previous / Next |
| Swipe Up / Down | Volume up / down |
| Circle clockwise / counter-clockwise | Seek |

Use Gesture Map to assign any listed gesture to another command. Hold Frames, Cooldown, and Confidence Threshold adjust the recognition reliability gate. Training captures forty normalized examples of a named custom pose, persists them in local storage, and supports JSON export/import and deletion.

## Open your own presentation

In **Demo App → Slides**, choose **Add files** or drag a file onto the slide stage. GestureDeck accepts one PDF, one PowerPoint `.pptx`, or up to forty images in one selection. Previous/Next gestures and keyboard controls navigate the imported pages just like the built-in demo. The app opens the file locally in the browser; file bytes are not uploaded and the import is cleared when the page is refreshed. Each selected file must be under 100 MB and the total image batch under 150 MB.

Imported PowerPoint slides are rendered as static pages: animations and transitions do not play, and some advanced chart or SmartArt elements may be simplified. The viewer may request substitute fonts from Google Fonts; this sends font names only, not presentation contents.

Keyboard fallback: **Space** pause, **Enter** play, **Left/Right** previous/next, **Up/Down** volume, **M** mute, **Escape** stop, **P** start, **S** seek, **R** rotate the virtual fan, and **F** exit fullscreen. The Presentation Viewer uses next/previous for slide navigation and Play/Start to enter fullscreen. Shortcuts are suppressed while a text field, button, or dialog is focused.

## Architecture

```text
getUserMedia ──> HandLandmarker (GPU → CPU)
                          │ 21 smoothed points
                          ▼
          features / staticClassifier / dynamicClassifier / KNN
                          │ held + threshold + cooldown
                          ▼
                    commandBus
                ┌─────────┼─────────┐
                ▼         ▼         ▼
            Media app   Slides   Virtual devices
                                      │
                                      └── optional WebSocket relay
```

All camera frames, landmark classification, and training data remain browser-local. Hardware messages use a small in-memory WebSocket relay at `/api/ws`; the client generates a random 128-bit pairing channel and persists it in this browser. In the Hardware tab, connect the controller to the prefilled built-in URL and copy the device URL for the device-side WebSocket client. Treat that copied URL like a pairing code and share it only with the device being paired. The built-in relay accepts `role=controller` and `role=device`; it forwards validated command packets to devices on the same channel and reports the connected-device count to controllers. An external `wss://` endpoint can still be entered instead.

The device-side relay protocol is intentionally small: connect using the copied URL, read JSON text packets shaped like `{ "type": "command", "command": "Next", "gesture": "Point Right", "confidence": 0.84, "at": 1234567890 }`, and reconnect if the socket closes. The controller receives `{ "type": "status", "devices": 1 }` when paired devices join or leave. The relay is memory-only and does not retain messages or connections.

## Real-world use cases

- Classroom and conference presentations, without returning to a laptop.
- Accessibility experiments for people with limited reach or motor control.
- Kitchens and clinical spaces where touching a shared screen is inconvenient.
- Smart-home or IoT prototyping through a trusted WebSocket gateway.
- Hands-free media control and gesture-driven game prototypes.

## Limitations

This is a prototype, not a safety-critical controller. Hand pose estimation depends on lighting, camera quality, framing, and the hand being visible. Static classification uses hand geometry heuristics; custom KNN requires consistent examples. Fast movement and unusual orientations can be ambiguous. Browser camera APIs need a secure context. The built-in relay is generic and in-memory; no device-specific firmware is included. CDN access is needed to load the MediaPipe model and PowerPoint font substitutions. Generated audio is a small oscillator demonstration, not bundled music.

## Future work

Add a richer orientation-invariant pose model, per-user calibration, cancellation/undo gestures, multi-hand input, more robust dynamic temporal models, confidence calibration, relay authentication and protocol discovery, and device-specific integrations.
