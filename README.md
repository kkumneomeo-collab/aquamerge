# PlushMerge: Cozy Plushie Toybox 🧸✨

[![GitHub Release](https://img.shields.io/github/v/release/kkumneomeo-collab/aquamerge?color=ff69b4&label=Latest%20Release)](https://github.com/kkumneomeo-collab/aquamerge/releases/latest)
[![Download Android APK](https://img.shields.io/badge/Download-Android%20APK%20(8.8MB)-22c55e?logo=android&logoColor=white)](https://github.com/kkumneomeo-collab/aquamerge/releases/download/v1.0.0/PlushMerge-v1.0.apk)

A cozy, relaxing physics-based plush toy merge puzzle game built for mobile and desktop browsers. Drop, roll, and merge plushie friends—from tiny sweet strawberries to celestial axolotls—inside a warm honey-cream toybox showcase.

### 📥 Direct Downloads
- **Direct APK Download**: [PlushMerge-v1.0.apk (8.8 MB)](https://github.com/kkumneomeo-collab/aquamerge/releases/download/v1.0.0/PlushMerge-v1.0.apk)
- **GitHub Release Page**: [v1.0.0 Release](https://github.com/kkumneomeo-collab/aquamerge/releases/tag/v1.0.0)
- **Repository Raw File**: [release/PlushMerge-v1.0.apk](https://github.com/kkumneomeo-collab/aquamerge/raw/main/release/PlushMerge-v1.0.apk)

## ✨ Features
- **Clean Plain Pastel Pink Aesthetic**: Soft pastel pink velvet interior (`#FFF5F7` / `#FDF2F8`), felt cushion floor, and minimalist distraction-free backdrop.
- **Arcade Claw Machine Crane Arm**:
  - Top overhead gantry steel rails spanning the ceiling.
  - Motorized trolley with chrome wheels and glowing arcade status LED.
  - Braided vertical steel cable and star-embossed claw hub.
  - Articulated triple mechanical claw prongs with rubberized grip pads that dynamically wrap around the held plushie.
  - Spring-recoil claw release animation upon drop with zero visual snap.
- **Progressive Claw Drop Unlocks**:
  - The claw machine drop pool begins with only Tier 1 (Sweet Berry) and unlocks higher tiers (Sunny Chick, Fluffy Bat, Cosmic Pip) progressively as you achieve new target discovery goals!
  - Higher tiers (Tiers 5–10) remain prestigious merge-only trophies so the toybox stays balanced.
- **10 Adorable Plushie Tiers (Scaled Small to Large)**:
  1. 🍓 **Sweet Berry Plushie** (Radius 25px / Diam 50px)
  2. 🐥 **Sunny Chick Plushie** (Radius 33px / Diam 66px)
  3. 🦇 **Fluffy Bat Plushie** (Radius 42px / Diam 84px)
  4. 👾 **Cosmic Pip Alien Plushie** (Radius 52px / Diam 104px)
  5. 🐧 **Scarfie Penguin Plushie** (Radius 64px / Diam 128px)
  6. 🐰 **Moonlight Lop Bunny Plushie** (Radius 77px / Diam 154px)
  7. 🦋 **Dreamy Flutter Butterfly Plushie** (Radius 91px / Diam 182px)
  8. 🦁 **Golden Lion Plushie** (Radius 106px / Diam 212px)
  9. 🐲 **Baby Sky Drake Plushie** (Radius 123px / Diam 246px)
  10. 🌸 **Celestial Axolotl Plushie** (Radius 142px / Diam 284px)
- **💣 3-Second Timed Plushie Star Bomb**:
  - Arm the dropper with the Pink Felt Sparkle Bomb.
  - Features an animated golden star spark fuse.
  - Drops into the toybox and starts an exact **3.0-second countdown badge** (`3`, `2`, `1`).
  - At 3 seconds, detonates with a massive shockwave, clearing all plushies within its 160px blast radius, physically tossing nearby survivors with outward shockwave force, and awarding double bonus points!
- **Bouncy Spring Physics**: Restitution at 0.36, collision squash & stretch with elastic recovery for a soft stuffed-animal feel.
- **Accurate 360° Radial Profile Physics**: Substep collision resolution with zero overlap and zero excessive gaps.

## 📱 Mobile Apps (Android & iOS)

This project includes complete, production-ready native projects for both Android and iOS powered by Capacitor:

### 🤖 Android (APK & Android Studio Project)
- **Directory**: `android/`
- **Output APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Build APK locally**:
  ```bash
  npm run cap:android
  cd android && ./gradlew assembleDebug
  ```
- **Open in Android Studio**:
  ```bash
  npx cap open android
  ```

### 🍎 iOS (Xcode Project & Workspace)
- **Directory**: `ios/App/`
- **Workspace**: `ios/App/App.xcworkspace`
- **Open in Xcode**:
  ```bash
  npx cap open ios
  ```
  Double-click `ios/App/App.xcworkspace` in Xcode on macOS, select your development team, and press **Run** (or **Product > Archive** to build an `.ipa` for TestFlight / App Store).

### ☁️ Automated GitHub Actions CI Builds
Pushing to the `main` branch automatically triggers `.github/workflows/build-mobile.yml` on GitHub, compiling the latest Android APK and validating the iOS workspace as downloadable GitHub Artifacts.

## 🚀 How to Run Web Version Locally
```bash
python3 -m http.server 8765
```
Then open `http://localhost:8765` in your browser.
