# GestureDeck

Touch-free hand gesture control for a browser-based demo. GestureDeck uses MediaPipe Hands locally in the browser and maps recognized input to a generated-tone player, presentations, a synthetic medical-scan viewer, practice mode, and local virtual devices.

## Care Mode problem statement

Hospital staff may need to review a scan or request assistance while wearing gloves or avoiding a shared touch surface. Care Mode demonstrates touch-free navigation through synthetic scan slices and a simulated Call Nurse alert. It is a prototype, not a medical device: its scans are generated placeholders, the alert does not contact staff, and it must not be used for patient care.

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

Choose **Operating Room** to open the synthetic Medical Viewer with slice, zoom, rotation, playback, and Call Nurse gesture mappings. Choose **Bedside Patient** to open the local Virtual Devices panel. Both presets map Victory to Call Nurse; hold the pose steadily for about two seconds while the progress ring fills. The alert is local and simulated only.

## Open your own presentation

In **Demo App → Slides**, choose **Add files** or drag a file onto the slide stage. GestureDeck accepts one PDF, one PowerPoint `.pptx`, or up to forty images in one selection. Previous/Next gestures and keyboard controls navigate the imported pages just like the built-in demo. The app opens the file locally in the browser; file bytes are not uploaded and the import is cleared when the page is refreshed. Each selected file must be under 100 MB and the total image batch under 150 MB.

Imported PowerPoint slides are rendered as static pages: animations and transitions do not play, and some advanced chart or SmartArt elements may be simplified. The viewer may request substitute fonts from Google Fonts; this sends font names only, not presentation contents.

Keyboard fallback: **Space** pause, **Enter** play, **Left/Right** previous/next, **Up/Down** volume or scan zoom, **M** mute, **Escape** stop, **P** start, **S** seek, **R** rotate the scan or virtual fan, and **F** exit fullscreen. The Presentation Viewer uses next/previous for slide navigation and Play/Start to enter fullscreen. Shortcuts are suppressed while a text field, button, or dialog is focused.

## Architecture

```text
getUserMedia ──> HandLandmarker (GPU → CPU)
                          │ 21 smoothed points
                          ▼
          features / staticClassifier / dynamicClassifier / KNN
                           │ held + threshold + cooldown
                    ┌──────┴───────────┐
                    ▼                  ▼
                commandBus      Call Nurse handler
           ┌─────┬─────┬─────┐      (2s hold)
           ▼     ▼     ▼     ▼           ▼
         Media Slides Medical Viewer  Virtual devices
                     (synthetic)        (local)
                                      Simulated alert
```

All camera frames, landmark classification, training data, presentation files, and synthetic scan rendering stay in the browser. GestureDeck does not connect to physical devices or send nurse-call alerts.

## Real-world use cases

- Classroom and conference presentations, without returning to a laptop.
- Accessibility experiments for people with limited reach or motor control.
- Hospital workflow demonstrations using generated imagery only, not clinical use.
- Kitchens and shared spaces where touching a screen is inconvenient.
- Hands-free media control and gesture-driven game prototypes.

## Limitations

This is a prototype, not a safety-critical controller or medical device. Hand pose estimation depends on lighting, camera quality, framing, and the hand being visible. Static classification uses hand geometry heuristics; custom KNN requires consistent examples. Fast movement and unusual orientations can be ambiguous. Browser camera APIs need a secure context. Care Mode uses synthetic placeholder scans and a simulated alert that does not notify anyone. CDN access is needed to load the MediaPipe model and PowerPoint font substitutions. Generated audio is a small oscillator demonstration, not bundled music.

## Future work

Add a richer orientation-invariant pose model, per-user calibration, cancellation/undo gestures, multi-hand input, more robust dynamic temporal models, confidence calibration, and clearer simulation states.
