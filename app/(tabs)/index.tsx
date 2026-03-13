import React, { useRef } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SafeStorage from '../../utils/SafeStorage';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radii } from '../../constants/typography';
import { StatCard } from '../../components/ui/StatCard';

const { width } = Dimensions.get('window');
const CHART_W = width - Spacing.xl * 2;

// Mock weekly data matching the web app
const weeklyData = [
    { day: 'Mon', val: 15 }, { day: 'Tue', val: 22 }, { day: 'Wed', val: 8 },
    { day: 'Thu', val: 35 }, { day: 'Fri', val: 42 }, { day: 'Sat', val: 5 }, { day: 'Sun', val: 12 },
];
const alertDist = [
    { name: 'Safe', value: 145, color: Colors.safe },
    { name: 'Warning', value: 28, color: Colors.warning },
    { name: 'Critical', value: 7, color: Colors.critical },
];
const hourlyData = [
    { time: '00:00', val: 45 }, { time: '04:00', val: 82 }, { time: '08:00', val: 15 },
    { time: '12:00', val: 20 }, { time: '16:00', val: 25 }, { time: '20:00', val: 40 },
];

// Simple inline bar chart (no external lib needed for simple bar charts)
function MiniBarChart({ data }: { data: { day: string; val: number }[] }) {
    const maxVal = Math.max(...data.map(d => d.val));
    const barWidth = (CHART_W - (data.length - 1) * 6) / data.length;
    return (
        <View style={chartStyles.container}>
            {data.map(item => (
                <View key={item.day} style={chartStyles.barGroup}>
                    <View style={chartStyles.barTrack}>
                        <View style={[chartStyles.bar, {
                            height: `${(item.val / maxVal) * 100}%`,
                            backgroundColor: Colors.blue,
                            width: barWidth,
                        }]} />
                    </View>
                    <Text style={chartStyles.barLabel}>{item.day}</Text>
                </View>
            ))}
        </View>
    );
}

function AlertDistRow({ data }: { data: typeof alertDist }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    return (
        <View>
            {/* Segmented bar */}
            <View style={[distStyles.bar, { overflow: 'hidden' }]}>
                {data.map(d => (
                    <View key={d.name} style={{ flex: d.value / total, backgroundColor: d.color }} />
                ))}
            </View>
            {/* Legend */}
            <View style={distStyles.legend}>
                {data.map(d => (
                    <View key={d.name} style={distStyles.legendItem}>
                        <View style={[distStyles.dot, { backgroundColor: d.color }]} />
                        <Text style={distStyles.legendLabel}>{d.name}</Text>
                        <Text style={[distStyles.legendVal, { color: d.color }]}>{d.value}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default function DashboardTab() {
    const router = useRouter();
    const scrollY = useRef(new Animated.Value(0)).current;

    const handleLogout = async () => {
        await SafeStorage.removeItem('vigilance_logged_in');
        router.replace('/login');
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>
                        Vigilance<Text style={{ color: Colors.blue }}>.AI</Text>
                    </Text>
                    <Text style={styles.headerSub}>⚡ Edge AI • Always On-Device</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.driveModeBtn}
                        onPress={() => router.push('/drive-mode')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.driveModeText}>🚗 Drive</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.avatar} onPress={handleLogout} activeOpacity={0.8}>
                        <Text style={styles.avatarText}>JD</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* ── STAT CARDS ── */}
                <View style={styles.statsGrid}>
                    <View style={styles.statsRow}>
                        <StatCard
                            title="Total Alerts"
                            value="31"
                            subtitle="↘ -12% vs last week"
                            accentColor={Colors.amber}
                            icon={<Text>⚠️</Text>}
                            style={styles.statHalf}
                        />
                        <StatCard
                            title="Avg EAR"
                            value="0.26"
                            subtitle="↗ +5% improving"
                            accentColor={Colors.blue}
                            icon={<Text>👁</Text>}
                            style={styles.statHalf}
                        />
                    </View>
                    <View style={styles.statsRow}>
                        <StatCard
                            title="Sleep Episodes"
                            value="7"
                            subtitle="↘ -3 this week"
                            accentColor={Colors.purple}
                            icon={<Text>😴</Text>}
                            style={styles.statHalf}
                        />
                        <StatCard
                            title="Drive Hours"
                            value="24.5h"
                            subtitle="↗ +2.5h total"
                            accentColor={Colors.emerald}
                            icon={<Text>🕐</Text>}
                            style={styles.statHalf}
                        />
                    </View>
                </View>

                {/* ── WEEKLY TREND ── */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.cardTitle}>Weekly Drowsiness Trend</Text>
                            <Text style={styles.cardSub}>Minutes of drowsiness detected per day</Text>
                        </View>
                        <Text style={{ fontSize: 20 }}>📈</Text>
                    </View>
                    <MiniBarChart data={weeklyData} />
                </View>

                {/* ── ALERT DISTRIBUTION ── */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.cardTitle}>Alert Distribution</Text>
                            <Text style={styles.cardSub}>Past 7 days breakdown</Text>
                        </View>
                        <Text style={{ fontSize: 20 }}>🔴</Text>
                    </View>
                    <AlertDistRow data={alertDist} />
                </View>

                {/* ── PEAK RISK HOURS ── */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.cardTitle}>24-Hour Risk Pattern</Text>
                            <Text style={styles.cardSub}>Average drowsiness level by time of day</Text>
                        </View>
                        <Text style={{ fontSize: 20 }}>🕐</Text>
                    </View>
                    <View style={hourlyStyles.grid}>
                        {hourlyData.map(h => {
                            const risk = h.val > 60 ? Colors.critical : h.val > 30 ? Colors.warning : Colors.safe;
                            return (
                                <View key={h.time} style={hourlyStyles.block}>
                                    <View style={[hourlyStyles.dot, { backgroundColor: risk, shadowColor: risk }]} />
                                    <Text style={hourlyStyles.time}>{h.time}</Text>
                                    <Text style={[hourlyStyles.val, { color: risk }]}>{h.val}%</Text>
                                </View>
                            );
                        })}
                    </View>
                    {/* Risk legend */}
                    <View style={hourlyStyles.legend}>
                        {[{ l: 'Low', c: Colors.safe }, { l: 'Moderate', c: Colors.warning }, { l: 'High', c: Colors.critical }].map(i => (
                            <View key={i.l} style={hourlyStyles.legendItem}>
                                <View style={[hourlyStyles.legendDot, { backgroundColor: i.c }]} />
                                <Text style={hourlyStyles.legendText}>{i.l}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── QUICK ACTION ── */}
                <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => router.push('/monitor')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.startBtnText}>🎥  Start Live Monitoring</Text>
                </TouchableOpacity>

                <View style={{ height: Spacing.xl }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.appBg },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        letterSpacing: 1,
    },
    headerSub: {
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    driveModeBtn: {
        backgroundColor: Colors.cardBg,
        borderRadius: Radii.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    driveModeText: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: Typography.weights.semibold },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: Colors.blue,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontWeight: Typography.weights.bold, fontSize: Typography.sizes.sm },
    scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base },
    statsGrid: { gap: Spacing.sm, marginBottom: Spacing.base },
    statsRow: { flexDirection: 'row', gap: Spacing.sm },
    statHalf: { flex: 1 },
    card: {
        backgroundColor: Colors.cardBg,
        borderRadius: Radii.xxl,
        padding: Spacing.base,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.base,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.base,
    },
    cardTitle: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
    },
    cardSub: {
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    startBtn: {
        backgroundColor: Colors.blue,
        borderRadius: Radii.xl,
        paddingVertical: Spacing.base,
        alignItems: 'center',
        marginBottom: Spacing.sm,
        shadowColor: Colors.blue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
        elevation: 10,
    },
    startBtnText: {
        color: '#fff',
        fontWeight: Typography.weights.bold,
        fontSize: Typography.sizes.base,
        letterSpacing: 0.5,
    },
});

const chartStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 120,
        gap: 6,
        paddingTop: 8,
    },
    barGroup: { flex: 1, alignItems: 'center', gap: 4 },
    barTrack: { flex: 1, justifyContent: 'flex-end', width: '100%' },
    bar: { borderRadius: 4, alignSelf: 'center' },
    barLabel: { fontSize: 10, color: Colors.textMuted },
});

const distStyles = StyleSheet.create({
    bar: { height: 12, borderRadius: 6, flexDirection: 'row', marginBottom: Spacing.base, overflow: 'hidden' },
    legend: { flexDirection: 'row', justifyContent: 'space-between' },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    legendLabel: { fontSize: Typography.sizes.xs, color: Colors.textSecondary },
    legendVal: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
});

const hourlyStyles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginBottom: Spacing.base,
    },
    block: { alignItems: 'center', gap: 4 },
    dot: {
        width: 16, height: 16, borderRadius: 8,
        shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6, elevation: 4,
    },
    time: { fontSize: 10, color: Colors.textMuted },
    val: { fontSize: 11, fontWeight: Typography.weights.bold },
    legend: { flexDirection: 'row', gap: Spacing.base },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: Typography.sizes.xs, color: Colors.textSecondary },
});
