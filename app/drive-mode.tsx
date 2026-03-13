import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Animated, Dimensions, StatusBar,
} from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, AlertLevel, getAlertColors } from '../constants/Colors';
import { Typography, Spacing, Radii } from '../constants/typography';
import { MonitoringState } from '../MonitoringState';

const { width, height } = Dimensions.get('window');

const STATUS_INFO: Record<AlertLevel, { headline: string; subtext: string; icon: string }> = {
    Safe: { headline: 'ALL CLEAR', subtext: 'Driver is alert. Keep your eyes on the road.', icon: '✓' },
    Warning: { headline: 'WARNING', subtext: 'Signs of fatigue detected. Stay focused.', icon: '⚠' },
    Critical: { headline: 'CRITICAL', subtext: 'Drowsiness detected. Please pull over safely.', icon: '⚠' },
};

export default function DriveModeScreen() {
    useKeepAwake();
    const router = useRouter();

    // In real usage, get this from a shared state/context (monitoring hook)
    // For drive mode demo, cycle through states
    const [level, setLevel] = useState<AlertLevel>('Safe');
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const bgAnim = useRef(new Animated.Value(0)).current;

    const { color, bg } = getAlertColors(level);
    const info = STATUS_INFO[level];

    // Pulse the icon when critical
    useEffect(() => {
        if (level === 'Critical') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1.0, duration: 500, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
            Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        }
    }, [level]);

    // Flash bg when level changes
    useEffect(() => {
        Animated.sequence([
            Animated.timing(bgAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
            Animated.timing(bgAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
        ]).start();
    }, [level]);

    // Demo: cycle states for testing
    const cycleState = () => {
        const next = level === 'Safe' ? 'Warning' : level === 'Warning' ? 'Critical' : 'Safe';
        MonitoringState.setLevel(next);
        setLevel(next);
    };

    // Listen to real global monitoring state
    useEffect(() => {
        const unsubscribe = MonitoringState.subscribe(l => {
            setLevel(l);
        });
        return () => { unsubscribe(); };
    }, []);

    return (
        <View style={styles.screen}>
            <StatusBar hidden />

            {/* Background color */}
            <Animated.View style={[
                StyleSheet.absoluteFill,
                {
                    backgroundColor: bgAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['#000000', color + '33'],
                    }),
                },
            ]} />

            {/* Subtle glow blob */}
            <View style={[styles.glow, { backgroundColor: color + '18' }]} />

            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                {/* Top bar */}
                <View style={styles.topBar}>
                    <View style={styles.brandPill}>
                        <Text style={styles.brandDot}>⚡</Text>
                        <Text style={styles.brandText}>VIGILANCE.AI  •  DRIVE MODE</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.exitBtn}
                        onPress={() => router.back()}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.exitBtnText}>✕  Exit Drive Mode</Text>
                    </TouchableOpacity>
                </View>

                {/* ── CENTRAL ALERT DISPLAY ── */}
                <View style={styles.center}>
                    {/* Big icon */}
                    <Animated.View style={[
                        styles.iconCircle,
                        {
                            backgroundColor: color + '20',
                            borderColor: color,
                            transform: [{ scale: pulseAnim }],
                            shadowColor: color,
                        },
                    ]}>
                        <Text style={[styles.iconTxt, { color }]}>{info.icon}</Text>
                    </Animated.View>

                    {/* Headline */}
                    <Text style={[styles.headline, { color }]}>{info.headline}</Text>

                    {/* Subtext */}
                    <View style={[styles.subtextBox, { backgroundColor: color + '15', borderColor: color + '40' }]}>
                        <Text style={[styles.subtext, { color }]}>{info.subtext}</Text>
                    </View>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: Colors.border }]} />

                    {/* Live metric pills */}
                    <View style={styles.metricsRow}>
                        {[
                            { label: 'EAR', value: '0.287', color: Colors.cyan },
                            { label: 'MAR', value: '0.214', color: Colors.purple },
                            { label: 'Blinks', value: '14', color: Colors.emerald },
                            { label: 'Yawns', value: '2', color: Colors.amber },
                        ].map(m => (
                            <View key={m.label} style={styles.metricPill}>
                                <Text style={styles.metricLabel}>{m.label}</Text>
                                <Text style={[styles.metricVal, { color: m.color }]}>{m.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Bottom — demo toggle + status indicator */}
                <View style={styles.bottomBar}>
                    {/* Demo button to cycle states */}
                    <TouchableOpacity style={styles.testBtn} onPress={cycleState} activeOpacity={0.8}>
                        <Text style={styles.testBtnText}>🔄  Simulate Alert State</Text>
                    </TouchableOpacity>

                    {/* Status indicator */}
                    <View style={[styles.statusPill, { borderColor: color + '50', backgroundColor: color + '12' }]}>
                        <View style={[styles.statusDot, { backgroundColor: color, shadowColor: color }]} />
                        <Text style={[styles.statusPillText, { color }]}>
                            {level === 'Safe' ? 'MONITORING — AI ACTIVE' : level === 'Warning' ? 'FATIGUE DETECTED' : 'CRITICAL — PULL OVER'}
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#000' },
    safe: { flex: 1 },

    glow: {
        position: 'absolute',
        top: -100,
        left: width / 2 - 200,
        width: 400,
        height: 400,
        borderRadius: 200,
    },

    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.base,
    },
    brandPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: Radii.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    brandDot: { fontSize: 14 },
    brandText: { fontSize: Typography.sizes.xs, color: Colors.textSecondary, fontWeight: Typography.weights.semibold, letterSpacing: 1 },
    exitBtn: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: Radii.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    exitBtnText: { color: Colors.textSecondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },

    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        gap: Spacing.xl,
    },
    iconCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 30,
        elevation: 20,
    },
    iconTxt: {
        fontSize: 72,
        fontWeight: Typography.weights.black,
    },
    headline: {
        fontSize: Typography.sizes.giant,
        fontWeight: Typography.weights.black,
        letterSpacing: -2,
        textAlign: 'center',
    },
    subtextBox: {
        borderRadius: Radii.lg,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.sm,
        borderWidth: 1,
    },
    subtext: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.medium,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    divider: { width: width * 0.6, height: 1 },
    metricsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    metricPill: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: Radii.lg,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        minWidth: 80,
    },
    metricLabel: { fontSize: Typography.sizes.sm, color: Colors.textMuted, letterSpacing: 0.5 },
    metricVal: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, fontVariant: ['tabular-nums'] },

    bottomBar: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xl,
        gap: Spacing.base,
        alignItems: 'center',
    },
    testBtn: {
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: Radii.lg,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    testBtnText: { color: Colors.textSecondary, fontSize: Typography.sizes.sm },

    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        borderRadius: Radii.full,
        borderWidth: 1,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 6,
    },
    statusPillText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, letterSpacing: 1 },
});
