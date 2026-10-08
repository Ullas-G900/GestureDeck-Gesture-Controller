import type { Command } from '../commands/commandBus';

export type VirtualDevices = { lamp: boolean; fan: boolean };

export const initialVirtualDevices: VirtualDevices = { lamp: false, fan: false };

export function applyVirtualDeviceCommand(
  devices: VirtualDevices,
  command: Command,
): VirtualDevices {
  switch (command) {
    case 'Start':
      return { ...devices, lamp: true };
    case 'Stop':
      return { lamp: false, fan: false };
    case 'Rotate':
      return { ...devices, fan: !devices.fan };
    default:
      return devices;
  }
}

export const virtualDeviceNames: Record<keyof VirtualDevices, string> = {
  lamp: 'Studio light',
  fan: 'Desk fan',
};
