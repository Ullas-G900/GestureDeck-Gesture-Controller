# GestureDeck Care

**Touch-free control where touching is unsafe or impossible.**

GestureDeck Care turns an ordinary webcam into a hand-gesture controller for hospitals. Surgeons can scroll, zoom and freeze scans without touching a screen. Patients who cannot reach a call button can control the room and call a nurse with a gesture. It runs entirely in the browser, so no video leaves the device.

Built for the **Zero One Hackathon, Problem 02: Hand Gesture Controller** (Computer Vision and Human-Computer Interaction).

- Live demo: `[add your published link]`
- Demo video: `[add your recording link]`
- Pitch deck: `[add your deck link]`

> **Prototype notice:** GestureDeck Care is a hackathon prototype with simulated devices and placeholder scans. It is not a certified medical device and must not be used for clinical decisions.

---

## The problem

Two groups in a hospital often cannot touch the controls they need.

**The gloved surgical team.** Surgeons, assistants and scrub nurses must stay sterile, but still need to view and control scans mid-procedure. Today they ask a helper, cover the mouse with a sterile towel, or leave the sterile field and re-scrub.

- A meta-analysis of 488,594 patients found a surgical site infection (SSI) incidence of **11%** in adult general surgery.
- In a large US sample, one SSI added **9.7 days** of stay and **$20,842** per admission.
- A touchless-control review found sterility is the most commonly cited reason for touchless control.

**Patients who cannot reach or press a call button.**

- A UK national audit of inpatient falls found **19%** of patients could not reach their call bell.
- Up to **80%** of stroke survivors have upper limb impairment early after a stroke.
- India counted **2.68 crore** people with disabilities in Census 2011, and recorded over **1.25 million** new strokes in 2021.

The usual workarounds fall short. Voice control struggles with operating room noise and masks. Foot pedals handle only a few switch-like functions. Fixed call buttons need a hand that can reach them.

Sources are listed at the end of this file. These figures show the size of the burden. They do not show that touching screens causes a set share of infections.

## The solution

A webcam reads the hand, a classifier names the gesture, and a safety layer decides whether to act. The command then drives one of three things:

1. **Medical Viewer:** a scan viewer with 8 generated placeholder slices.
2. **Virtual Devices:** a light and a fan.
3. **Nurse Call:** a pulsing alert banner, a beep and a log entry.

### The strongest differentiator

**The system learns each patient's own gestures.** Many patients cannot make a standard thumbs up. In the **Train** tab, a user records 30 to 50 samples of a gesture they can make, and it is learned in the browser with k-nearest-neighbors. Fixed gesture sets cannot do this.

### Other features

- **Safety layer:** hold-to-confirm, cooldown, a freeze gesture, and a 2-second hold before Call Nurse fires.
- **Two scenarios, one engine:** Operating Room and Bedside Patient presets, each with its own gesture map and demo app.
- **Zero install and private:** runs in the browser on any webcam. Video is processed on the device.

## Gestures

### Operating Room preset

| Gesture | Command |
|---|---|
| Swipe left or right | Previous or next slice |
| Circle | Zoom and rotate the image |
| Open palm | Freeze the view |
| Closed fist | Reset zoom and rotation |

### Bedside Patient preset

| Gesture | Command |
|---|---|
| Thumbs up | Light on |
| Closed fist | Light off |
| Swipe up or down | Fan speed up or down |
| Victory sign, held 2 seconds | Call nurse |

### Default gesture map (editable in the **Gesture Map** tab)

| Gesture | Type | Default command |
|---|---|---|
| Open palm | Static | Pause |
| Thumbs up | Static | Start or play |
| Point left | Static | Previous |
| Point right | Static | Next |
| Closed fist | Static | Stop |
| Victory | Static | Call nurse (2-second hold) |
| Swipe left, right, up, down | Dynamic | Previous, next, volume up, volume down |
| Circle clockwise | Dynamic | Rotate |
| Circle counter-clockwise | Dynamic | Seek |

Keyboard fallbacks: `Space` pause, `Enter` play, arrow keys to navigate or change volume, `M` mute.

## How it works

```
 INPUT                 PROCESSING                                    OUTPUT
+--------+  frames  +-----------+  x,y,z  +------------+ gesture +-------------+ command +----------------+
| Webcam | -------> | MediaPipe | ------> | Classifier | ------> | Command bus | ------> | Scan viewer    |
+--------+          | Hand      |         | rules,     |         | hold +      |         | Light and fan  |
                    | Landmarker|         | motion,    |         | cooldown    |         | Nurse alert    |
                    +-----------+         | kNN        |         +-------------+         +----------------+
                                          +------------+                |
                                               |                        |
                                        low score: ignored      not held: ignored
```

1. **See.** Each webcam frame goes to MediaPipe.
2. **Read.** 21 hand points become a gesture and a confidence score.
3. **Filter.** A low score, an unknown pose or a short hold is ignored.
4. **Act.** The command fires once, then waits through a cooldown.

### How unclear gestures are ignored

- **Landmark smoothing:** an exponential moving average steadies the 21 points.
- **Confidence threshold:** poses below the threshold are dropped, and "unknown" frames never count.
- **Hold-to-confirm:** the same gesture must be seen for about 6 to 8 frames before it fires.
- **Cooldown:** about 800 ms between commands.
- **Dynamic gestures are paused** while a static gesture is being held.
- **Call Nurse** needs a 2-second hold, shown as a progress ring.

Hold frames, cooldown and the confidence threshold are adjustable in the **Tuning** drawer.

## Tech stack

| Layer | Used |
|---|---|
| Languages | TypeScript, JavaScript, HTML, CSS |
| Frameworks | React, Vite, Tailwind CSS, Express |
| Libraries | `@mediapipe/tasks-vision`, Web Audio API |
| Models | MediaPipe Hand Landmarker (palm detector plus 21-point landmark model), k-nearest-neighbors (k=5) for custom gestures |
| Hardware | Any laptop with a webcam |

### Role of MediaPipe

MediaPipe turns video into 21 hand landmarks per frame. Everything after that is our own code: geometry rules for static poses, a motion tracker for swipes and circles, kNN for custom gestures, the safety layer and the command bus.

## Performance

| Figure | Value | Source |
|---|---|---|
| Frame rate | About 18 to 35 FPS | Observed in our Chrome demo |
| Model latency | 12.27 ms (GPU), 17.12 ms (CPU) | MediaPipe benchmark on Pixel 6, so a laptop will differ |
| Hold-to-confirm | About 0.3 s | 6 to 8 frames at 20 to 30 FPS |
| Cooldown | 800 ms | Default, adjustable |
| Gesture accuracy | `[add your measured result]`% | Measure it in Practice Mode |

## Getting started

### Requirements

- Node.js 18 or newer
- A webcam
- A modern browser such as Chrome or Edge. The camera needs HTTPS, or `localhost`.

### Run locally

```bash
git clone [your repository URL]
cd [your repository folder]
npm install
npm run dev
```

Open the address shown in the terminal and allow camera access.

### Build for production

```bash
npm run build
```

### Run on Replit

Import the repository into Replit and press **Run**. Open the preview in its own tab so the camera permission prompt works.

The hand model loads from Google's servers, so the first load needs an internet connection.

## Using the app

1. Allow the camera when the onboarding screen asks.
2. Pick a **Scenario**: Operating Room or Bedside Patient.
3. Try **Practice Mode** to check each gesture and measure your accuracy.
4. Open **Train** to record a custom gesture, then map it to any command in **Gesture Map**.
5. Watch the **Log** tab for each recognized command.

## Project structure

```
src/
  vision/       handLandmarker.ts, features.ts, staticClassifier.ts,
                dynamicClassifier.ts, knn.ts
  commands/     commandBus.ts
  apps/         MedicalViewer, VirtualDevices, MediaPlayer, Slides
  components/   UI components
server/         Express server that serves the built app
```

A single command bus sends every recognized gesture to any subscriber. Adding a new controllable app or device means adding one subscriber.

## Privacy and safety

- All video processing happens in the browser. No video is recorded, stored or uploaded.
- Custom gestures are saved only in the browser's local storage.
- Safety features (hold, cooldown, freeze, 2-second Call Nurse hold) exist to stop accidental triggers.

## Limitations

- Prototype only. Devices are simulated, and scans are generated placeholders.
- Lighting, camera angle and distance affect accuracy. Good front light helps.
- Patients with limited hand movement may need simple or custom gestures.
- Our own gesture accuracy has not been clinically validated.
- Real clinical use would need clinical validation and regulatory approval.

## Roadmap

1. **Now:** measure accuracy in Practice Mode.
2. **Next:** pilot with 2 to 3 clinicians.
3. **Then:** add a wake gesture so nothing fires until it is hailed.
4. **Later:** connect a DICOM scan viewer, add a voice backup, bundle the model for offline use, and support multi-hand control.

## Sources

- Gillespie BM et al. Worldwide incidence of surgical site infections in general surgical patients. 2021. https://psnet.ahrq.gov/issue/worldwide-incidence-surgical-site-infections-general-surgical-patients-systematic-review-and
- Surgical site infection: incidence and impact on hospital utilization and treatment costs. Am J Infect Control, 2009. https://pubmed.ncbi.nlm.nih.gov/19398246/
- Royal College of Physicians national audit of inpatient falls, reported by RCNi. https://rcni.com/node/123476
- IIT Madras, post-stroke upper limb impairment. https://www.iitm.ac.in/hi/node/12878
- Census 2011 disability count, Deccan Herald. https://www.deccanherald.com/india/house-panel-concerned-over-actual-number-of-disabled-people-1172530.html
- India stroke rates, Down To Earth. https://www.downtoearth.org.in/amp/story/health/whats-behind-the-massive-spike-in-stroke-rates-globally-in-india
- MediaPipe Hand Landmarker guide. https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker

## Team

`[codeXchamps]` · `[Ullas.G ,Rishitha BR ,Ajay Krishna V ,Sushmitha]` · [BGSCET,ISE DEPARTMENT]`

