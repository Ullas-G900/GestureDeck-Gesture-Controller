export const slides = [
  {
    eyebrow: '01 / THE PROBLEM',
    title: 'Hands busy.\nScreens untouched.',
    body: 'A presenter should not have to break a moment to find a tiny button. GestureDeck turns natural hand movement into reliable, visible commands.',
  },
  {
    eyebrow: '02 / THE INPUT',
    title: 'Twenty-one points.\nOne clear signal.',
    body: 'A single hand is tracked in-browser. Landmark geometry is normalized to hand size, then smoothed before intent is considered.',
  },
  {
    eyebrow: '03 / THE PIPELINE',
    title: 'From camera\nto command.',
    body: 'Camera → Landmarks → Classifier → Command → Action. Every stage is surfaced so the demo can be trusted, tuned, and explained.',
  },
  {
    eyebrow: '04 / THE INTERACTION',
    title: 'Hold to confirm.\nAct with confidence.',
    body: 'A short frame hold filters transitional poses. Cooldown prevents repeated triggers. Confidence gates uncertain frames.',
  },
  {
    eyebrow: '05 / THE USE CASES',
    title: 'Designed for\nhands-full moments.',
    body: 'Presentations, accessible control, kitchens, clinical environments, and smart spaces all benefit from touch-free input.',
  },
  {
    eyebrow: '06 / WHAT NEXT',
    title: 'Your hands.\nYour interface.',
    body: 'GestureDeck is a client-side prototype. Train a personal pose, remap commands, or connect a relay when the application is ready.',
  },
] as const;
