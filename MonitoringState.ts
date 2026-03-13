import { AlertLevel } from './constants/Colors';

type Listener = (level: AlertLevel) => void;
let currentLevel: AlertLevel = 'Safe';
const listeners: Set<Listener> = new Set();

export const MonitoringState = {
    getLevel: () => currentLevel,
    setLevel: (level: AlertLevel) => {
        currentLevel = level;
        listeners.forEach(l => l(level));
    },
    subscribe: (listener: Listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }
};
