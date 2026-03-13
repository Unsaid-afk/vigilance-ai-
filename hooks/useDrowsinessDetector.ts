import { useRef, useState, useCallback } from 'react';
import { FACE_LANDMARKS } from '../constants/thresholds';

interface Point { x: number; y: number; z?: number; }

interface DrowsinessMetrics {
    ear: number;
    mar: number;
    blinks: number;
    yawns: number;
    faceDetected: boolean;
}

function euclidean(p1: Point, p2: Point): number {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

/**
 * Eye Aspect Ratio — same formula as utils.py on the Python backend.
 * EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
 * Expects 6 landmark points in the MediaPipe eye landmark order.
 */
function calculateEAR(pts: Point[]): number {
    if (pts.length < 6) return 0.3;
    const v1 = euclidean(pts[1], pts[5]);
    const v2 = euclidean(pts[2], pts[4]);
    const h = euclidean(pts[0], pts[3]);
    if (h === 0) return 0.3;
    return (v1 + v2) / (2.0 * h);
}

/**
 * Mouth Aspect Ratio — same formula as utils.py on the Python backend.
 * MAR = vertical / horizontal mouth distance
 * Expects 4 points: left corner, top lip, right corner, bottom lip.
 */
function calculateMAR(pts: Point[]): number {
    if (pts.length < 4) return 0.2;
    const v = euclidean(pts[1], pts[3]);
    const h = euclidean(pts[0], pts[2]);
    if (h === 0) return 0.2;
    return v / h;
}

/**
 * Core drowsiness detection hook.
 * Takes an array of 478 MediaPipe face landmarks and returns real-time metrics.
 * This replaces the entire Python backend — runs 100% on-device.
 */
export function useDrowsinessDetector() {
    const [metrics, setMetrics] = useState<DrowsinessMetrics>({
        ear: 0.30,
        mar: 0.20,
        blinks: 0,
        yawns: 0,
        faceDetected: false,
    });

    // Blink state machine
    const blinkRef = useRef({ count: 0, isBlinking: false });
    // Yawn state machine
    const yawnRef = useRef({ count: 0, isYawning: false });

    /**
     * processLandmarks — call this with the 478 normalized landmark array
     * from MediaPipe FaceLandmarker results on each camera frame.
     */
    const processLandmarks = useCallback((landmarks: Point[] | null) => {
        if (!landmarks || landmarks.length === 0) {
            setMetrics(prev => ({ ...prev, faceDetected: false }));
            return;
        }

        // Extract eye and mouth points using the same indices as detector.py
        const leftEyePts = FACE_LANDMARKS.LEFT_EYE.map(i => landmarks[i]);
        const rightEyePts = FACE_LANDMARKS.RIGHT_EYE.map(i => landmarks[i]);
        const mouthPts = FACE_LANDMARKS.MOUTH.map(i => landmarks[i]);

        const leftEAR = calculateEAR(leftEyePts);
        const rightEAR = calculateEAR(rightEyePts);
        const avgEAR = (leftEAR + rightEAR) / 2.0;
        const mar = calculateMAR(mouthPts);

        // Blink detection state machine (EAR < 0.22 = eyes closed)
        if (avgEAR < 0.22) {
            if (!blinkRef.current.isBlinking) {
                blinkRef.current.count++;
                blinkRef.current.isBlinking = true;
            }
        } else {
            blinkRef.current.isBlinking = false;
        }

        // Yawn detection state machine (MAR > 0.50 = mouth open wide)
        if (mar > 0.50) {
            if (!yawnRef.current.isYawning) {
                yawnRef.current.count++;
                yawnRef.current.isYawning = true;
            }
        } else {
            yawnRef.current.isYawning = false;
        }

        setMetrics({
            ear: parseFloat(avgEAR.toFixed(3)),
            mar: parseFloat(mar.toFixed(3)),
            blinks: blinkRef.current.count,
            yawns: yawnRef.current.count,
            faceDetected: true,
        });
    }, []);

    const resetCounts = useCallback(() => {
        blinkRef.current = { count: 0, isBlinking: false };
        yawnRef.current = { count: 0, isYawning: false };
        setMetrics({ ear: 0.30, mar: 0.20, blinks: 0, yawns: 0, faceDetected: false });
    }, []);

    return { metrics, processLandmarks, resetCounts };
}
