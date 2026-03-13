// Design System — Vigilance AI
// Matches the web app's color language exactly, ported to React Native

export const Colors = {
    // Backgrounds
    appBg: '#050A14',
    cardBg: '#0D1526',
    panelBg: '#111D33',
    inputBg: '#0A1220',
    overlayBg: 'rgba(5,10,20,0.95)',

    // Borders
    border: '#1E2D4A',
    borderLight: '#253553',
    borderFocus: '#0EA5E9',

    // Status
    safe: '#10B981',
    safeBg: 'rgba(16,185,129,0.12)',
    safeBorder: 'rgba(16,185,129,0.4)',

    warning: '#F59E0B',
    warningBg: 'rgba(245,158,11,0.12)',
    warningBorder: 'rgba(245,158,11,0.4)',

    critical: '#EF4444',
    criticalBg: 'rgba(239,68,68,0.12)',
    criticalBorder: 'rgba(239,68,68,0.4)',

    // Brand accents
    blue: '#0EA5E9',
    blueDark: '#0369A1',
    blueGlow: 'rgba(14,165,233,0.35)',
    purple: '#A855F7',
    purpleGlow: 'rgba(168,85,247,0.3)',
    cyan: '#06B6D4',
    emerald: '#10B981',
    amber: '#F59E0B',
    rose: '#EF4444',

    // Text
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#475569',

    // Gradients (used as array for LinearGradient)
    gradBlue: ['#0EA5E9', '#0369A1'] as const,
    gradPurple: ['#A855F7', '#7C3AED'] as const,
    gradCyan: ['#06B6D4', '#0EA5E9'] as const,
    gradEmerald: ['#10B981', '#059669'] as const,
    gradAmber: ['#F59E0B', '#D97706'] as const,
    gradRose: ['#EF4444', '#DC2626'] as const,
    gradSafe: ['#10B981', '#059669'] as const,
    gradWarning: ['#F59E0B', '#D97706'] as const,
    gradCritical: ['#EF4444', '#DC2626'] as const,
    gradBrand: ['#0EA5E9', '#A855F7'] as const,
};

export type AlertLevel = 'Safe' | 'Warning' | 'Critical';

export function getAlertColors(level: AlertLevel) {
    switch (level) {
        case 'Safe': return { color: Colors.safe, bg: Colors.safeBg, border: Colors.safeBorder, grad: Colors.gradSafe };
        case 'Warning': return { color: Colors.warning, bg: Colors.warningBg, border: Colors.warningBorder, grad: Colors.gradWarning };
        case 'Critical': return { color: Colors.critical, bg: Colors.criticalBg, border: Colors.criticalBorder, grad: Colors.gradCritical };
    }
}
