import { useState, useCallback, useRef, useEffect } from 'react';
import { Vibration, Platform } from 'react-native';

import type { AlertLevel } from '../constants/Colors';

interface AlertSettings {
    earWarning: number;
    earCritical: number;
    marCritical: number;
    soundAlerts: boolean;
    vibrationAlerts: boolean;
}

interface EventLog {
    id: number;
    type: AlertLevel;
    message: string;
    time: string;
}

const CRITICAL_VIBRATION = [0, 400, 200, 400, 200, 400];
const WARNING_VIBRATION = [0, 300, 100, 300];

export function useAlertManager(settings: AlertSettings) {
    const [alertLevel, setAlertLevel] = useState<AlertLevel>('Safe');
    const [recentEvents, setRecentEvents] = useState<EventLog[]>([]);
    const soundRef = useRef<any | null>(null);
    const lastAlertRef = useRef<AlertLevel>('Safe');

    // Determine alert level from live EAR/MAR
    const computeAlertLevel = useCallback((ear: number, mar: number): AlertLevel => {
        if (ear < settings.earCritical || mar > settings.marCritical) return 'Critical';
        if (ear < settings.earWarning) return 'Warning';
        return 'Safe';
    }, [settings.earWarning, settings.earCritical, settings.marCritical]);

    const addEvent = useCallback((level: AlertLevel) => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
        const msgs: Record<AlertLevel, string> = {
            Safe: 'Driver alert and focused. System nominal.',
            Warning: 'Warning — Signs of fatigue. EAR dropping.',
            Critical: 'CRITICAL — Immediate drowsiness detected!',
        };
        setRecentEvents(prev => [
            { id: Date.now(), type: level, message: msgs[level], time: timeStr },
            ...prev,
        ].slice(0, 10));
    }, []);

    const triggerAlert = useCallback(async (level: AlertLevel) => {
        setAlertLevel(level);

        if (level === lastAlertRef.current) return; // avoid repeat triggers
        lastAlertRef.current = level;
        addEvent(level);

        if (level === 'Safe') return;

        // Vibration
        if (settings.vibrationAlerts) {
            if (Platform.OS === 'android') {
                Vibration.vibrate(level === 'Critical' ? CRITICAL_VIBRATION : WARNING_VIBRATION);
            } else {
                Vibration.vibrate(level === 'Critical' ? 600 : 300);
            }
        }

        // Sound
        if (settings.soundAlerts) {
            try {
                const Audio = require('expo-av').Audio;
                if (!Audio?.Sound) {
                    console.warn('[AlertManager] Audio.Sound is null');
                    return;
                }
                if (soundRef.current) {
                    await soundRef.current.stopAsync();
                    await soundRef.current.unloadAsync();
                }
                const { sound } = await Audio.Sound.createAsync(
                    level === 'Critical'
                        ? require('../assets/sounds/alert_critical.mp3')
                        : require('../assets/sounds/alert_warning.mp3'),
                    { shouldPlay: true, volume: 1.0 }
                );
                soundRef.current = sound;
            } catch (e) {
                console.error('[AlertManager] Sound playback failed:', e);
            }
        }
    }, [settings, addEvent]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            soundRef.current?.unloadAsync();
        };
    }, []);

    return { alertLevel, recentEvents, computeAlertLevel, triggerAlert, setAlertLevel, addEvent };
}
