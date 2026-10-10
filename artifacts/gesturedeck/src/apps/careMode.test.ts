import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CALL_NURSE_HOLD_MS,
  careScenarioPresets,
  defaultMapping,
  gestureHoldProgress,
  isGestureHoldComplete,
  mappingForScenario,
} from './careMode';

test('Operating Room selects the Medical Viewer and maps scan controls', () => {
  const preset = careScenarioPresets['Operating Room'];
  assert.equal(preset.app, 'Medical Viewer');
  assert.equal(preset.tab, 'Demo App');
  assert.equal(preset.mapping.Victory, 'Call Nurse');
  assert.equal(preset.mapping['Circle CW'], 'Rotate');
  assert.equal(preset.mapping['Circle CCW'], 'Seek');
});

test('Bedside Patient opens local devices with useful device gestures', () => {
  const preset = careScenarioPresets['Bedside Patient'];
  assert.equal(preset.app, 'Virtual Devices');
  assert.equal(preset.tab, 'Devices');
  assert.equal(preset.mapping['Thumbs Up'], 'Start');
  assert.equal(preset.mapping['Circle CW'], 'Rotate');
  assert.equal(preset.mapping.Victory, 'Call Nurse');
});

test('default gesture bindings still cover Level 1 poses and dynamic motions', () => {
  assert.equal(defaultMapping['Open Palm'], 'Pause');
  assert.equal(defaultMapping['Thumbs Up'], 'Play');
  assert.equal(defaultMapping['Point Left'], 'Previous');
  assert.equal(defaultMapping['Point Right'], 'Next');
  assert.equal(defaultMapping['Closed Fist'], 'Stop');
  assert.equal(defaultMapping['Swipe Left'], 'Previous');
  assert.equal(defaultMapping['Swipe Right'], 'Next');
  assert.equal(defaultMapping['Circle CW'], 'Seek');
  assert.equal(defaultMapping['Circle CCW'], 'Seek');
});

test('scenario presets preserve mappings for trained gestures', () => {
  const current = { ...defaultMapping, 'My pose': 'Mute' as const };
  const next = mappingForScenario('Operating Room', current);
  assert.equal(next.Victory, 'Call Nurse');
  assert.equal(next['My pose'], 'Mute');
});

test('Call Nurse requires two seconds while ordinary gestures keep frame holds', () => {
  assert.equal(
    isGestureHoldComplete('Call Nurse', 60, CALL_NURSE_HOLD_MS - 1, 7),
    false,
  );
  assert.equal(
    isGestureHoldComplete('Call Nurse', 60, CALL_NURSE_HOLD_MS, 7),
    true,
  );
  assert.equal(gestureHoldProgress('Call Nurse', 60, 1000, 7), 0.5);
  assert.equal(isGestureHoldComplete('Pause', 7, 100, 7), true);
  assert.equal(gestureHoldProgress('Pause', 2, 100, 7), 2 / 7);
});
