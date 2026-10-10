import type { Command } from '../commands/commandBus';

export type CareScenario = 'Operating Room' | 'Bedside Patient';
export type DemoApp = 'Media Player' | 'Presentation Viewer' | 'Medical Viewer';
export type CareExperience = DemoApp | 'Virtual Devices';
export type DashboardTab = 'Demo App' | 'Gesture Map' | 'Train' | 'Devices' | 'Log';
export type GestureAction = Command | 'Call Nurse';
export type GestureMap = Record<string, GestureAction>;
export type DashboardEvent = {
  command: GestureAction;
  gesture: string;
  confidence: number;
  at: number;
};

export const builtInGestures = [
  'Open Palm',
  'Thumbs Up',
  'Point Left',
  'Point Right',
  'Closed Fist',
  'Victory',
  'Swipe Left',
  'Swipe Right',
  'Swipe Up',
  'Swipe Down',
  'Circle CW',
  'Circle CCW',
];

export const defaultMapping: GestureMap = {
  'Open Palm': 'Pause',
  'Thumbs Up': 'Play',
  'Point Left': 'Previous',
  'Point Right': 'Next',
  'Closed Fist': 'Stop',
  Victory: 'Volume up',
  'Swipe Left': 'Previous',
  'Swipe Right': 'Next',
  'Swipe Up': 'Volume up',
  'Swipe Down': 'Volume down',
  'Circle CW': 'Seek',
  'Circle CCW': 'Seek',
};

export const commandList: GestureAction[] = [
  'Pause',
  'Play',
  'Previous',
  'Next',
  'Stop',
  'Volume up',
  'Volume down',
  'Mute',
  'Seek',
  'Rotate',
  'Start',
  'Exit fullscreen',
  'Call Nurse',
];

export const careScenarioPresets: Record<
  CareScenario,
  { app: CareExperience; tab: DashboardTab; mapping: GestureMap }
> = {
  'Operating Room': {
    app: 'Medical Viewer',
    tab: 'Demo App',
    mapping: {
      ...defaultMapping,
      Victory: 'Call Nurse',
      'Swipe Up': 'Seek',
      'Swipe Down': 'Rotate',
      'Circle CW': 'Rotate',
      'Circle CCW': 'Seek',
    },
  },
  'Bedside Patient': {
    app: 'Virtual Devices',
    tab: 'Devices',
    mapping: {
      ...defaultMapping,
      'Thumbs Up': 'Start',
      'Point Left': 'Stop',
      'Point Right': 'Start',
      'Closed Fist': 'Stop',
      Victory: 'Call Nurse',
      'Swipe Left': 'Stop',
      'Swipe Right': 'Start',
      'Swipe Up': 'Start',
      'Swipe Down': 'Stop',
      'Circle CW': 'Rotate',
      'Circle CCW': 'Rotate',
    },
  },
};

export const CALL_NURSE_HOLD_MS = 2000;

export function mappingForScenario(
  scenario: CareScenario,
  currentMapping: GestureMap,
): GestureMap {
  const next = { ...careScenarioPresets[scenario].mapping };
  for (const [gesture, action] of Object.entries(currentMapping)) {
    if (!builtInGestures.includes(gesture)) next[gesture] = action;
  }
  return next;
}

export function gestureHoldProgress(
  action: GestureAction | undefined,
  frames: number,
  elapsedMs: number,
  normalHoldFrames: number,
): number {
  const progress =
    action === 'Call Nurse'
      ? elapsedMs / CALL_NURSE_HOLD_MS
      : frames / Math.max(1, normalHoldFrames);
  return Math.max(0, Math.min(1, progress));
}

export function isGestureHoldComplete(
  action: GestureAction | undefined,
  frames: number,
  elapsedMs: number,
  normalHoldFrames: number,
): boolean {
  return action === 'Call Nurse'
    ? elapsedMs >= CALL_NURSE_HOLD_MS
    : frames === normalHoldFrames;
}
