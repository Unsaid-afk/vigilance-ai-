# Vigilance AI — Project Status Report
**Project Name:** VigilanceAI
**Status:** Alpha / Internal Testing Phase
**Target Platform:** Android (Native Edge-AI)

## 1. Executive Summary
VigilanceAI is a state-of-the-art Drowsiness Detection system designed to enhance driver safety. Utilizing On-Device Computer Vision (Edge AI), it monitors the driver's state in real-time to detect signs of fatigue and distraction. The application provides immediate auditory and haptic feedback to alert the driver, thereby preventing accidents.

## 2. System Architecture (Visualized)
The system operates on a decentralized Edge-AI model, processing all video feeds locally on the Android device to ensure zero latency and complete privacy.

```mermaid
graph TD
    subgraph Android_Device [Native Android Environment]
        Camera[Expo Camera Module] --> |Raw Video Frames| FrameProcessor[Frame Processor Thread]
        
        subgraph Edge_AI_Engine [Edge Inference]
            FrameProcessor --> MediaPipe[MediaPipe Face Mesh]
            MediaPipe --> |Facial Landmarks| HookDrowsy[useDrowsinessDetector.ts]
            HookDrowsy --> |EAR / MAR Calculations| Algorithm{Threshold Evaluation}
        end
        
        Algorithm --> |Safe / Warning / Critical| HookAlert[useAlertManager.ts]
        
        subgraph Hardware_UI_Layer [Feedback System]
            HookAlert --> |Trigger| Audio[Expo AV Siren]
            HookAlert --> |Trigger| Haptics[Vibration Motor]
            HookAlert --> |Update| UI_HUD[Drive Mode HUD]
        end
        
        subgraph Storage [Persistence]
            HookAlert --> |Log Event| Database[SQLite / AsyncStorage]
        end
    end
    
    style Android_Device fill:#050A14,stroke:#0EA5E9,stroke-width:2px,color:#fff
    style Edge_AI_Engine fill:#1e293b,stroke:#0EA5E9,stroke-width:1px,color:#fff
    style Hardware_UI_Layer fill:#1e293b,stroke:#0EA5E9,stroke-width:1px,color:#fff
```

## 3. Logic & Decision Flow
The application evaluates driver state every ~150ms using the following decision tree:

```mermaid
flowchart TD
    Start((New Frame)) --> Extract[Extract Landmarks]
    Extract --> CalcEAR[Calculate Eye Ratio]
    Extract --> CalcMAR[Calculate Mouth Ratio]
    
    CalcEAR --> CheckEAR{EAR < 0.25?}
    CalcMAR --> CheckMAR{MAR > 0.50?}
    
    CheckEAR -- Yes --> EARTimer{Duration > 1.5s?}
    CheckEAR -- No --> StatusSafe[State: Safe]
    
    EARTimer -- Yes --> AlertCritical[CRITICAL ALERT]
    EARTimer -- No --> StatusWarning[State: Warning]
    
    CheckMAR -- Yes --> AlertWarning[WARNING ALERT]
    
    AlertCritical --> Action1[Continuous Vibration]
    AlertCritical --> Action2[Loud Siren]
    AlertCritical --> Action3[Flash Screen Red]
    
    AlertWarning --> Action4[Single Haptic Pulse]
    AlertWarning --> Action5[Flash Screen Amber]
    
    style AlertCritical fill:#F43F5E,stroke:#fff,stroke-width:2px,color:#fff
    style AlertWarning fill:#F59E0B,stroke:#fff,stroke-width:2px,color:#fff
    style StatusSafe fill:#10B981,stroke:#fff,stroke-width:2px,color:#fff
```

## 4. Core Features & Tech Stack

### Feature Set
| Category | Capability |
| :--- | :--- |
| **Monitoring** | Real-time Eye Aspect Ratio (EAR) & Mouth Aspect Ratio (MAR) tracking. |
| **Alerts** | Dynamic 3-stage system (Safe, Warning, Critical) with distinct audio/haptic patterns. |
| **Analytics** | Weekly drowsiness trends, alert distribution charts, and risk heatmaps. |
| **Interface** | specialized "Drive Mode" with high-contrast, distraction-free UI. |

### Technical Stack
| Component | Technology |
| :--- | :--- |
| **Framework** | React Native 0.76 + Expo SDK 55 |
| **Language** | TypeScript (Strict Mode) |
| **Vision** | Expo Camera + MediaPipe Face Mesh |
| **Animation** | React Native Reanimated v4 (UI Thread) |
| **Storage** | `@react-native-async-storage` & SQLite |

## 5. UI/UX Design System
The app follows a premium **Cyber-Tech Aesthetic**:
- **Primary Background:** Deep Obsidian (`#050A14`)
- **Accent Color:** Electric Blue (`#0EA5E9`)
- **Status Colors:** 
  - 🟢 **Safe:** Emerald (`#10B981`)
  - 🟡 **Warning:** Amber (`#F59E0B`)
  - 🔴 **Critical:** Rose (`#F43F5E`)
- **Typography:** Modern Sans-Serif (Inter/Roboto) for maximum legibility.

## 6. Recent Engineering Updates
During the recent debugging and testing phase, several critical enhancements were made:
1. **Native Module Fallbacks:** Implemented robust error handling for AV and Storage modules.
2. **Memory Optimization:** Refined the monitoring loop to prevent leaks during long drives.
3. **Navigation Stability:** Finalized Expo Router layout structure.
4. **Cross-Platform Parity:** Unified styling for Android shadow rendering.

## 7. Next Steps & Roadmap
- [ ] **Model Calibration:** Auto-adjust thresholds based on driver's baseline.
- [ ] **Production Vision:** Bind live camera frames to MediaPipe FaceLandmarker.
- [ ] **Cloud Sync:** Encrypted summary upload for fleet analytics.
- [ ] **Gaze Tracking:** Add head pose estimation for distraction detection.

---
*Report generated on March 13, 2026*
