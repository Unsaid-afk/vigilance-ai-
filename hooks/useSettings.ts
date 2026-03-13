import { useState, useCallback } from 'react';
import SafeStorage from '../utils/SafeStorage';

const SETTINGS_KEY = 'vigilance_settings';

export interface AppSettings {
    earWarning: number;
    earCritical: number;
    marWarning: number;
    marCritical: number;
    overallSensitivity: number;
    soundAlerts: boolean;
    vibrationAlerts: boolean;
    autoMusic: boolean;
    alertVolume: number;
    beepSound: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
    earWarning: 0.25,
    earCritical: 0.20,
    marWarning: 0.50,
    marCritical: 0.60,
    overallSensitivity: 50,
    soundAlerts: true,
    vibrationAlerts: true,
    autoMusic: false,
    alertVolume: 75,
    beepSound: 'Classic Beep',
};

export function useSettings() {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [loaded, setLoaded] = useState(false);

    const loadSettings = useCallback(async () => {
        try {
            const stored = await SafeStorage.getItem(SETTINGS_KEY);
            if (stored) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
        } catch (_) { }
        setLoaded(true);
    }, []);

    const saveSettings = useCallback(async (updated: Partial<AppSettings>) => {
        const newSettings = { ...settings, ...updated };
        setSettings(newSettings);
        try {
            await SafeStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
        } catch (_) { }
    }, [settings]);

    const resetDefaults = useCallback(async () => {
        setSettings(DEFAULT_SETTINGS);
        try {
            await SafeStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
        } catch (_) { }
    }, []);

    return { settings, loaded, loadSettings, saveSettings, resetDefaults };
}
