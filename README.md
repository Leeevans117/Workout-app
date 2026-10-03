# ApexPulse 🏋️‍♂️
> Modern dark-mode fitness companion featuring Dr. Stuart McGill's Big 3 spine protocol with 10s prep timers, consolidated Strength training, cardio modality selector (E-Bike vs. Spinning), procedural anatomical motion models, and consistency progress tracking.

---

## 📱 Installing on Your Android Device (PWA)

ApexPulse is built as an installable **Progressive Web App (PWA)**:
1. Open the app URL in **Google Chrome** on your Android device.
2. Tap the **"Install on Android"** button in the header, OR tap Chrome's three dots menu (`⋮`) in the top right.
3. Tap **"Install app"** (or **"Add to Home screen"**).
4. The ApexPulse icon will appear on your Android home screen and in your app drawer. It launches in full-screen standalone mode with zero browser address bars and supports offline caching!

---

## 🚀 Pushing to a GitHub Repository

You can push this entire project to a GitHub repository with these simple terminal commands:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Add all files to staging
git add .

# 3. Create your initial commit
git commit -m "Initial commit: ApexPulse McGill Big 3 & Workout Tracker PWA"

# 4. Create an empty repository on GitHub (e.g. https://github.com/your-username/apex-pulse)

# 5. Link your local project to your GitHub repository
git remote add origin https://github.com/your-username/apex-pulse.git

# 6. Push to main branch
git branch -M main
git push -u origin main
```

---

## 🌐 Would the App Run From a Repository?

A GitHub repository stores your source code files. To **run the application live online directly from your repository**, you have several 100% free, 1-click options:

### Option A: Vercel (Recommended - 1 Click)
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New Project"** and select your `apex-pulse` repository.
3. Vercel automatically detects Vite + React and deploys it in under 30 seconds.
4. Any changes you push to GitHub will automatically trigger a live update!

### Option B: Netlify (Free & Fast)
1. Go to [netlify.com](https://netlify.com) and log in with GitHub.
2. Select your repository. Netlify sets the build command (`npm run build`) and publish directory (`dist`).
3. Click **"Deploy"**.

### Option C: GitHub Pages (Directly from GitHub)
1. In your GitHub repository, go to **Settings** > **Pages**.
2. Under **Build and deployment**, set Source to **GitHub Actions**.
3. Choose the static Vite deployment template.

### Option D: Run Locally on Any Computer
```bash
git clone https://github.com/your-username/apex-pulse.git
cd apex-pulse
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## ⚡ Key Features

- **Dr. Stuart McGill's Big 3 Core Protocol**:
  - Modified Curl-Up (Hands under lumbar spine, neutral lordosis, 10s isometric holds)
  - Side Bridge / Plank (Stacked forearm, quadratus lumborum & lateral obliques)
  - Bird Dog (Quadruped opposite arm/leg reach, anti-rotational level plane)
  - **Mandatory 10-Second Prep Timer**: Enforces abdominal wall bracing and alignment before each hold.
- **Consolidated Strength Routine**:
  - Full-body push, pull, squat, hinge, and plank movements with automatic rest intervals.
- **Cardio Modality Selector**:
  - Select between outdoor **E-Bike** (wind resistance, assist modes, speed) or indoor **Spinning** (80-110 RPM flywheel cadence).
- **Kinematic Anatomical Motion Models**:
  - Volumetric, shaded human muscular models showcasing accurate joint pivot points and active muscle complexes.
- **Web Audio Sound Notifications**:
  - Distinct synthesized chimes for *Exercise Timer Ends*, *Rest Begins*, *Rest Ends*, and *3-2-1 Prep Beeps*.
- **Consistency Calendar Dashboard**:
  - Automatically places a verified green checkmark (`✓`) on the day upon workout completion.
  - Current streak counter with animated flame and weekly target progress bar.
- **Daily Push Notifications**:
  - Sends scheduled morning reminders detailing today's expected workout split.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 (Athletic dark theme)
- **Audio**: Web Audio API (Synthesized acoustic chimes with zero external file dependencies)
- **PWA Engine**: `vite-plugin-pwa` + Web App Manifest + Service Worker caching
- **Icons**: Lucide React
- **Celebration**: Canvas Confetti
