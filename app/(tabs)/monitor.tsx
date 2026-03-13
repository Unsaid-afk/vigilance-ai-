import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Animated, Dimensions, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, AlertLevel, getAlertColors } from '../../constants/Colors';
import { Typography, Spacing, Radii } from '../../constants/typography';
import { MetricGauge } from '../../components/ui/MetricGauge';
import { AlertBadge } from '../../components/ui/AlertBadge';
import { useAlertManager } from '../../hooks/useAlertManager';
import { DEFAULT_SETTINGS } from '../../hooks/useSettings';
import { MonitoringState } from '../../MonitoringState';

const { width } = Dimensions.get('window');

interface LiveMetrics {
    ear: number;
    mar: number;
    blinks: number;
    yawns: number;
}

export default function MonitorTab() {
    useKeepAwake();

    const [permission, requestPermission] = useCameraPermissions();
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({ ear: 0.30, mar: 0.20, blinks: 0, yawns: 0 });

    const { alertLevel, recentEvents, computeAlertLevel, triggerAlert } = useAlertManager({
        earWarning: DEFAULT_SETTINGS.earWarning,
        earCritical: DEFAULT_SETTINGS.earCritical,
        marCritical: DEFAULT_SETTINGS.marCritical,
        soundAlerts: DEFAULT_SETTINGS.soundAlerts,
        vibrationAlerts: DEFAULT_SETTINGS.vibrationAlerts,
    });

    const alertAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const frameRef = useRef(0);
    const blinkRef = useRef({ count: 0, isBlinking: false });
    const yawnRef = useRef({ count: 0, isYawning: false });

    // Pulse on Critical
    useEffect(() => {
        if (alertLevel === 'Critical') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(1);
        }
    }, [alertLevel]);

    // Flash border on level change
    useEffect(() => {
        Animated.sequence([
            Animated.timing(alertAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
            Animated.timing(alertAnim, { toValue: 0, duration: 500, useNativeDriver: false }),
        ]).start();
    }, [alertLevel]);

    // ─── AI ENGINE / SIMULATION ─────────────────────────────────────────────────
    // This is the inference loop. In production, replace the EAR/MAR math below with:
    //   const { landmarks } = mediapipeFaceLandmarker.detect(frame);
    //   const ear = calculateEAR(landmarks); const mar = calculateMAR(landmarks);
    // The simulation produces a realistic fatigue cycle that cycles through all 3 alert states.
    useEffect(() => {
        if (!isMonitoring) return;

        const interval = setInterval(() => {
            const t = frameRef.current++;

            // EAR: simulates a slow fatigue cycle (sine wave drooping over ~30s)
            const ear = Math.max(0.12, Math.min(0.40,
                0.28 + Math.sin(t * 0.04) * 0.09 + (Math.random() - 0.5) * 0.015
            ));

            // MAR: mostly closed, random occasional yawn spike above 0.50
            const mar = Math.max(0.05, Math.min(0.80,
                0.20 + (Math.random() - 0.5) * 0.03 + (Math.sin(t * 0.07) > 0.85 ? 0.38 : 0)
            ));

            // Blink counter (EAR < 0.22 = eye closed)
            if (ear < 0.22) {
                if (!blinkRef.current.isBlinking) { blinkRef.current.count++; blinkRef.current.isBlinking = true; }
            } else { blinkRef.current.isBlinking = false; }

            // Yawn counter (MAR > 0.50 = open mouth)
            if (mar > 0.50) {
                if (!yawnRef.current.isYawning) { yawnRef.current.count++; yawnRef.current.isYawning = true; }
            } else { yawnRef.current.isYawning = false; }

            setLiveMetrics({
                ear: parseFloat(ear.toFixed(3)),
                mar: parseFloat(mar.toFixed(3)),
                blinks: blinkRef.current.count,
                yawns: yawnRef.current.count,
            });

            const level = computeAlertLevel(ear, mar);
            triggerAlert(level);
            MonitoringState.setLevel(level);
        }, 150);

        return () => clearInterval(interval);
    }, [isMonitoring, computeAlertLevel, triggerAlert]);

    const startMonitoring = useCallback(async () => {
        console.log('[Monitor] Starting monitoring...');
        if (!permission?.granted) {
            console.log('[Monitor] Requesting camera permission...');
            const { granted } = await requestPermission();
            if (!granted) {
                console.log('[Monitor] Camera permission denied');
                Alert.alert('Camera Required', 'Vigilance AI needs camera access to monitor drowsiness.');
                return;
            }
        }
        
        console.log('[Monitor] Permission granted, resetting counters...');
        // Reset session counters
        frameRef.current = 0;
        blinkRef.current = { count: 0, isBlinking: false };
        yawnRef.current = { count: 0, isYawning: false };
        setLiveMetrics({ ear: 0.30, mar: 0.20, blinks: 0, yawns: 0 });
        setIsMonitoring(true);
        console.log('[Monitor] Monitoring state set to TRUE');
    }, [permission]);

    const stopMonitoring = useCallback(() => {
        console.log('[Monitor] Stopping monitoring...');
        setIsMonitoring(false);
    }, []);

    const { color: alertColor, bg: alertBg, border: alertBorder } = getAlertColors(alertLevel);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── HEADER ── */}
                <View style={styles.header}>
                    <Text style={styles.title}>Live Monitor</Text>
                    <AlertBadge level={alertLevel} />
                </View>

                {/* ── EDGE AI BADGE ── */}
                <View style={styles.aiBadge}>
                    <Text style={styles.aiBadgeDot}>⚡</Text>
                    <Text style={styles.aiBadgeText}>Edge AI — Analysis runs 100% on-device</Text>
                </View>

                {/* ── CAMERA VIEWFINDER ── */}
                <Animated.View style={[
                    styles.cameraCard,
                    {
                        borderColor: alertAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [Colors.border, alertColor],
                        }),
                    },
                ]}>
                    {isMonitoring && permission?.granted ? (
                        <View style={styles.cameraContainer}>
                            <CameraView style={StyleSheet.absoluteFill} facing="front" />

                            {/* HUD Overlay */}
                            <View style={styles.hud} pointerEvents="none">
                                {/* Corner brackets */}
                                <View style={[styles.corner, styles.topLeft, { borderColor: alertColor }]} />
                                <View style={[styles.corner, styles.topRight, { borderColor: alertColor }]} />
                                <View style={[styles.corner, styles.botLeft, { borderColor: alertColor }]} />
                                <View style={[styles.corner, styles.botRight, { borderColor: alertColor }]} />

                                {/* Status pill */}
                                <View style={[styles.hudPill, { backgroundColor: alertBg, borderColor: alertBorder }]}>
                                    <Animated.View style={[styles.hudDot, { backgroundColor: alertColor, transform: [{ scale: pulseAnim }] }]} />
                                    <Text style={[styles.hudPillText, { color: alertColor }]}>
                                        {alertLevel === 'Safe' ? 'MONITORING ACTIVE' :
                                            alertLevel === 'Warning' ? 'FATIGUE DETECTED' : 'DROWSY — PULL OVER'}
                                    </Text>
                                </View>

                                {/* Bottom metric bar */}
                                <View style={styles.hudMetrics}>
                                    {[
                                        { label: 'EAR', value: liveMetrics.ear.toFixed(3), color: Colors.cyan },
                                        { label: 'MAR', value: liveMetrics.mar.toFixed(3), color: Colors.purple },
                                        { label: 'Blinks', value: String(liveMetrics.blinks), color: Colors.emerald },
                                        { label: 'Yawns', value: String(liveMetrics.yawns), color: Colors.amber },
                                    ].map(m => (
                                        <View key={m.label} style={styles.hudMetricItem}>
                                            <Text style={styles.hudMetricLabel}>{m.label}</Text>
                                            <Text style={[styles.hudMetricVal, { color: m.color }]}>{m.value}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.cameraPlaceholder}>
                            <Text style={styles.cameraPlaceholderIcon}>🎥</Text>
                            <Text style={styles.cameraPlaceholderTitle}>
                                {!permission?.granted ? 'Camera Permission Required' : 'Ready to Monitor'}
                            </Text>
                            <Text style={styles.cameraPlaceholderSub}>
                                {!permission?.granted
                                    ? 'Tap Start to grant camera access'
                                    : 'AI runs entirely on your device — no data is ever sent anywhere'}
                            </Text>
                        </View>
                    )}
                </Animated.View>

                {/* ── CONTROL BUTTON ── */}
                <TouchableOpacity
                    style={[styles.controlBtn, isMonitoring ? styles.stopBtn : styles.startBtn]}
                    onPress={isMonitoring ? stopMonitoring : startMonitoring}
                    activeOpacity={0.85}
                >
                    <Text style={styles.controlBtnText}>
                        {isMonitoring ? '⏹  Stop Monitoring' : '▶  Start Monitoring'}
                    </Text>
                </TouchableOpacity>

                {/* ── LIVE METRIC GAUGES ── */}
                <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                        <View style={styles.metricCardHeader}>
                            <Text style={styles.metricCardTitle}>Eye Aspect Ratio (EAR)</Text>
                            <Text>👁</Text>
                        </View>
                        <Text style={[styles.metricBigVal, { color: Colors.cyan }]}>
                            {liveMetrics.ear.toFixed(3)}
                        </Text>
                        <MetricGauge
                            label="" value={liveMetrics.ear} maxValue={0.45}
                            warningThreshold={0.25} criticalThreshold={true}
                        />
                        <Text style={styles.metricHint}>{'< 0.25 Warning  •  < 0.20 Critical'}</Text>
                    </View>

                    <View style={styles.metricCard}>
                        <View style={styles.metricCardHeader}>
                            <Text style={styles.metricCardTitle}>Mouth Aspect Ratio (MAR)</Text>
                            <Text>😮</Text>
                        </View>
                        <Text style={[styles.metricBigVal, { color: Colors.purple }]}>
                            {liveMetrics.mar.toFixed(3)}
                        </Text>
                        <MetricGauge
                            label="" value={liveMetrics.mar} maxValue={0.80}
                            warningThreshold={0.50} criticalThreshold={false}
                        />
                        <Text style={styles.metricHint}>{'>0.50 Warning  •  >0.60 Critical'}</Text>
                    </View>
                </View>

                {/* ── BLINK / YAWN COUNTERS ── */}
                <View style={styles.countersRow}>
                    <View style={styles.counterCard}>
                        <Text style={styles.counterEmoji}>👁</Text>
                        <Text style={[styles.counterVal, { color: Colors.emerald }]}>{liveMetrics.blinks}</Text>
                        <Text style={styles.counterLabel}>Blinks this session</Text>
                    </View>
                    <View style={styles.counterCard}>
                        <Text style={styles.counterEmoji}>🥱</Text>
                        <Text style={[styles.counterVal, { color: Colors.amber }]}>{liveMetrics.yawns}</Text>
                        <Text style={styles.counterLabel}>Yawns this session</Text>
                    </View>
                </View>

                {/* ── RECENT EVENTS LOG ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Recent Events</Text>
                    {recentEvents.length === 0 ? (
                        <View style={styles.noEvents}>
                            <Text style={styles.noEventsText}>No events yet — start monitoring to begin</Text>
                        </View>
                    ) : (
                        recentEvents.map(evt => {
                            const { color } = getAlertColors(evt.type);
                            return (
                                <View key={evt.id} style={styles.eventRow}>
                                    <View style={[styles.eventDot, { backgroundColor: color }]} />
                                    <Text style={styles.eventMsg} numberOfLines={2}>{evt.message}</Text>
                                    <Text style={styles.eventTime}>{evt.time}</Text>
                                </View>
                            );
                        })
                    )}
                </View>

                <View style={{ height: Spacing.xl }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const CORNER_SIZE = 28;

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.appBg },
    scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base },

    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: Spacing.sm,
    },
    title: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.textPrimary },

    aiBadge: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
        backgroundColor: Colors.blue + '15', borderRadius: Radii.full,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
        alignSelf: 'flex-start', marginBottom: Spacing.base,
        borderWidth: 1, borderColor: Colors.blue + '30',
    },
    aiBadgeDot: { fontSize: 12 },
    aiBadgeText: { fontSize: Typography.sizes.xs, color: Colors.blue, fontWeight: Typography.weights.semibold },

    cameraCard: {
        borderRadius: Radii.xxl, borderWidth: 2,
        overflow: 'hidden', height: 300,
        marginBottom: Spacing.base, backgroundColor: Colors.cardBg,
    },
    cameraContainer: { flex: 1 },
    hud: { ...StyleSheet.absoluteFillObject },
    corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderWidth: 3 },
    topLeft: { top: 12, left: 12, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 8 },
    topRight: { top: 12, right: 12, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 8 },
    botLeft: { bottom: 12, left: 12, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 8 },
    botRight: { bottom: 12, right: 12, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 8 },

    hudPill: {
        position: 'absolute', top: 16,
        left: CORNER_SIZE + 16, right: CORNER_SIZE + 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 6, paddingHorizontal: 12, borderRadius: Radii.full, borderWidth: 1,
    },
    hudDot: { width: 8, height: 8, borderRadius: 4 },
    hudPillText: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, letterSpacing: 1 },

    hudMetrics: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'space-around',
        backgroundColor: 'rgba(0,0,0,0.72)',
        paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    },
    hudMetricItem: { alignItems: 'center' },
    hudMetricLabel: { fontSize: 10, color: '#94A3B8', marginBottom: 2 },
    hudMetricVal: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, fontVariant: ['tabular-nums'] },

    cameraPlaceholder: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        padding: Spacing.xl, gap: Spacing.sm,
    },
    cameraPlaceholderIcon: { fontSize: 48, marginBottom: Spacing.sm },
    cameraPlaceholderTitle: {
        fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold,
        color: Colors.textPrimary, textAlign: 'center',
    },
    cameraPlaceholderSub: {
        fontSize: Typography.sizes.sm, color: Colors.textSecondary, textAlign: 'center',
    },

    controlBtn: {
        borderRadius: Radii.xl, paddingVertical: Spacing.base,
        alignItems: 'center', marginBottom: Spacing.base,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 10,
    },
    startBtn: { backgroundColor: Colors.blue, shadowColor: Colors.blue },
    stopBtn: { backgroundColor: Colors.critical, shadowColor: Colors.critical },
    controlBtnText: {
        color: '#fff', fontWeight: Typography.weights.bold,
        fontSize: Typography.sizes.base, letterSpacing: 0.5,
    },

    metricsGrid: { gap: Spacing.sm, marginBottom: Spacing.sm },
    metricCard: {
        backgroundColor: Colors.cardBg, borderRadius: Radii.xl,
        padding: Spacing.base, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
    },
    metricCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    metricCardTitle: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: Typography.weights.medium },
    metricBigVal: {
        fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold,
        fontVariant: ['tabular-nums'],
    },
    metricHint: { fontSize: Typography.sizes.xs, color: Colors.textMuted },

    countersRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
    counterCard: {
        flex: 1, backgroundColor: Colors.cardBg, borderRadius: Radii.xl,
        padding: Spacing.base, alignItems: 'center',
        borderWidth: 1, borderColor: Colors.border, gap: 4,
    },
    counterEmoji: { fontSize: 24 },
    counterVal: { fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
    counterLabel: { fontSize: Typography.sizes.xs, color: Colors.textSecondary, textAlign: 'center' },

    card: {
        backgroundColor: Colors.cardBg, borderRadius: Radii.xxl,
        padding: Spacing.base, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm,
    },
    cardTitle: {
        fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold,
        color: Colors.textPrimary, marginBottom: Spacing.base,
    },
    noEvents: { alignItems: 'center', paddingVertical: Spacing.xl },
    noEventsText: { color: Colors.textMuted, fontSize: Typography.sizes.sm },
    eventRow: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    eventDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
    eventMsg: { flex: 1, fontSize: Typography.sizes.sm, color: Colors.textSecondary },
    eventTime: { fontSize: Typography.sizes.xs, color: Colors.textMuted, fontVariant: ['tabular-nums'] },
});
