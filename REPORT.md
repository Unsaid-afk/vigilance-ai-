# Vigilance AI — Project Status Report
**Project Name:** VigilanceAI
**Status:** Alpha / Internal Testing Phase
**Target Platform:** iOS & Android (Cross-Platform)

## 1. Executive Summary
VigilanceAI is a state-of-the-art Drowsiness Detection system designed to enhance driver safety. Utilizing On-Device Computer Vision (Edge AI), it monitors the driver's state in real-time to detect signs of fatigue and distraction. The application provides immediate auditory and haptic feedback to alert the driver, thereby preventing accidents.

## 2. Core Features
- **Real-time Eye Monitoring:** Uses Eye Aspect Ratio (EAR) calculations to detect blinking patterns and prolonged eye closure.
- **Yawn Detection:** Monitors Mouth Aspect Ratio (MAR) to identify repetitive yawning as a sign of early-stage fatigue.
- **Dynamic Alert System:** Three-tier alerting mechanism (Safe, Warning, Critical) with color-coded UI indicators.
- **Multi-sensory Feedback:** Integrated vibration and audio alerts for critical drowsiness events.
- **Historical Analytics:** Visual representation of weekly drowsiness trends, alert distribution, and 24-hour risk patterns.
- **Drive Mode:** A focused, high-contrast monitoring interface optimized for in-car use.

## 3. Technical Architecture
### Frontend Stack
- **Framework:** Expo (React Native) with TypeScript.
- **Navigation:** Expo Router (File-based routing).
- **Styling:** Custom Design System using high-contrast dark mode, optimized for night-time visibility.
- **Animations:** Powered by `Moti` and `React Native Reanimated` for smooth, responsive interactions.

### Core Logic & AI
- **Monitoring Engine:** `hooks/useAlertManager.ts` handles the state transition between alert levels based on real-time computer vision metrics.
- **State Management:** A lightweight `MonitoringState.ts` observer pattern for global alert broadcasting.
- **Hardware Integration:**
    - `expo-camera`: High-frame rate face tracking.
    - `expo-av`: Synchronized sound alerts.
    - `React Native Vibration`: Pattern-based haptic feedback.

### Data Persistence
- **Storage:** `expo-sqlite` and `AsyncStorage` (wrapped in `SafeStorage` for error handling) for logging sessions and user preferences.

## 4. UI/UX & Design Language
The app follows a premium **Cyber-Tech Aesthetic**:
- **Palette:** Deep Obsidian (`#050A14`) background with Electric Blue accents and semantic status indicators (Emerald for Safe, Amber for Warning, Rose for Critical).
- **Data Visualization:** Custom-built lightweight bar charts and risk-pattern grids for transparency on driver safety records.
- **Typography:** Modern, sans-serif hierarchy for maximum readability under varying lighting conditions.

## 5. Recent Engineering Updates
During the recent debugging and testing phase, several critical enhancements were made:
- **Fallback Mechanisms:** Implemented robust fallbacks for Native Modules (AsyncStorage, AV) to ensure the app functional even when specific native features fail.
- **Navigation Stability:** Resolved route resolution errors and finalized the layout structure.
- **Memory Management:** Optimized the monitoring loop to prevent memory leaks during extended driving sessions.
- **Cross-Platform Parity:** Fixed styling inconsistencies between iOS and Android, particularly involving font weights and shadow rendering.

## 6. Next Steps & Roadmap
1. **Model Calibration:** Automated threshold adjustment based on individual driver's baseline EAR.
2. **Cloud Sync:** Secure transmission of encrypted summary data for fleet management.
3. **Advanced Detection:** Adding head position and distraction (gaze) tracking.
4. **Enhanced Diagnostics:** More detailed event logs including timestamps and captured metrics snapshots.

---
*Report generated on March 13, 2026*
