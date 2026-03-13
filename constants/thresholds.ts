// Detection thresholds — matches the Python backend logic exactly
export const DEFAULT_THRESHOLDS = {
    earWarning: 0.25,
    earCritical: 0.20,
    marWarning: 0.50,
    marCritical: 0.60,
    blinkRateWarning: 15, // blinks per minute (too few = eyes closing)
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
};

// MediaPipe FaceMesh landmark indices (identical to backend detector.py)
export const FACE_LANDMARKS = {
    LEFT_EYE: [33, 160, 158, 133, 153, 144],
    RIGHT_EYE: [362, 385, 387, 263, 373, 380],
    MOUTH: [78, 13, 308, 14],
};

// Frame processing interval (ms) — 150ms = ~6fps matching web, can go faster on device
export const FRAME_INTERVAL_MS = 100; // ~10fps on device for good accuracy

export const ALERT_DISPLAY_DURATION = 5000; // ms before clearing alert log entry
