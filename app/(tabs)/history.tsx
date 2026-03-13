import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radii } from '../../constants/typography';
import { StatCard } from '../../components/ui/StatCard';

const SESSIONS = [
    {
        id: '1', date: 'Feb 21, 2026', time: '08:30 – 10:15',
        riskLevel: 'High Risk' as const, duration: '1h 45m',
        totalAlerts: 12, critical: 3, drowsyTime: '15m', avgEar: 0.24, avgMar: 0.22,
    },
    {
        id: '2', date: 'Feb 20, 2026', time: '14:00 – 16:30',
        riskLevel: 'Medium Risk' as const, duration: '2h 30m',
        totalAlerts: 5, critical: 1, drowsyTime: '8m', avgEar: 0.28, avgMar: 0.20,
    },
    {
        id: '3', date: 'Feb 19, 2026', time: '07:15 – 08:45',
        riskLevel: 'Low Risk' as const, duration: '1h 30m',
        totalAlerts: 2, critical: 0, drowsyTime: '3m', avgEar: 0.31, avgMar: 0.18,
    },
];

const RISK_COLORS = {
    'High Risk': { bg: Colors.criticalBg, border: Colors.criticalBorder, text: Colors.critical },
    'Medium Risk': { bg: Colors.warningBg, border: Colors.warningBorder, text: Colors.warning },
    'Low Risk': { bg: Colors.safeBg, border: Colors.safeBorder, text: Colors.safe },
};

// EAR/MAR trend sparkline (simple horizontal dots)
function TrendDots({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 24, gap: 3 }}>
            {data.map((v, i) => {
                const h = max === min ? 12 : 6 + ((v - min) / (max - min)) * 18;
                return <View key={i} style={{ width: 4, height: h, borderRadius: 2, backgroundColor: color }} />;
            })}
        </View>
    );
}

const HISTORY_TREND_EAR = [0.30, 0.29, 0.27, 0.25, 0.22, 0.20, 0.24, 0.28];
const HISTORY_TREND_MAR = [0.20, 0.21, 0.23, 0.25, 0.27, 0.29, 0.24, 0.22];

export default function HistoryTab() {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Session History</Text>
                <View style={styles.filterBadge}>
                    <Text style={styles.filterText}>Past 30 days</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── SUMMARY STATS ── */}
                <View style={styles.statsRow}>
                    <StatCard title="Sessions" value="24" subtitle="↗ +3 this month" accentColor={Colors.cyan} icon={<Text>📅</Text>} style={styles.stat3} />
                    <StatCard title="Avg Duration" value="2h 10m" subtitle="↘ -15m vs prior" accentColor={Colors.purple} icon={<Text>🕐</Text>} style={styles.stat3} />
                    <StatCard title="Total Alerts" value="127" subtitle="↘ -18% improving" accentColor={Colors.amber} icon={<Text>⚠️</Text>} style={styles.stat3} />
                </View>

                {/* ── LATEST SESSION TREND ── */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.cardTitle}>Latest Session Analysis</Text>
                            <Text style={styles.cardSub}>EAR & MAR trends — Feb 21, 2026</Text>
                        </View>
                        <View style={styles.dateBadge}>
                            <Text style={styles.dateBadgeText}>1h 45m</Text>
                        </View>
                    </View>
                    <View style={styles.trendRow}>
                        <View style={styles.trendItem}>
                            <Text style={[styles.trendLabel, { color: Colors.cyan }]}>Eye Aspect Ratio</Text>
                            <TrendDots data={HISTORY_TREND_EAR} color={Colors.cyan} />
                        </View>
                        <View style={styles.trendItem}>
                            <Text style={[styles.trendLabel, { color: Colors.purple }]}>Mouth Aspect Ratio</Text>
                            <TrendDots data={HISTORY_TREND_MAR} color={Colors.purple} />
                        </View>
                    </View>
                    <View style={styles.trendFooter}>
                        <Text style={styles.trendFooterText}>⚠️ Trend shows progressive EAR decline — high fatigue session</Text>
                    </View>
                </View>

                {/* ── SESSION LIST ── */}
                <Text style={styles.sectionHeader}>Recent Sessions</Text>
                {SESSIONS.map(session => {
                    const rc = RISK_COLORS[session.riskLevel];
                    const isOpen = expanded === session.id;
                    return (
                        <TouchableOpacity
                            key={session.id}
                            style={styles.sessionCard}
                            onPress={() => setExpanded(isOpen ? null : session.id)}
                            activeOpacity={0.85}
                        >
                            {/* Card header */}
                            <View style={styles.sessionHeader}>
                                <View style={styles.sessionDateBox}>
                                    <Text style={styles.sessionDateIcon}>📅</Text>
                                    <View>
                                        <Text style={styles.sessionDate}>{session.date}</Text>
                                        <Text style={styles.sessionTime}>{session.time}</Text>
                                    </View>
                                </View>
                                <View style={[styles.riskBadge, { backgroundColor: rc.bg, borderColor: rc.border }]}>
                                    <Text style={[styles.riskBadgeText, { color: rc.text }]}>{session.riskLevel}</Text>
                                </View>
                            </View>

                            {/* Quick stats row */}
                            <View style={styles.sessionQuickStats}>
                                {[
                                    { label: 'Duration', value: session.duration, color: Colors.textPrimary },
                                    { label: 'Alerts', value: session.totalAlerts, color: Colors.amber },
                                    { label: 'Critical', value: session.critical, color: Colors.critical },
                                    { label: 'Drowsy Time', value: session.drowsyTime, color: Colors.warning },
                                ].map(s => (
                                    <View key={s.label} style={styles.quickStat}>
                                        <Text style={[styles.quickStatVal, { color: s.color }]}>{s.value}</Text>
                                        <Text style={styles.quickStatLabel}>{s.label}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Expanded details */}
                            {isOpen && (
                                <View style={styles.sessionDetails}>
                                    <View style={styles.detailsRow}>
                                        <View style={styles.detailItem}>
                                            <Text style={[styles.detailVal, { color: Colors.cyan }]}>{session.avgEar.toFixed(2)}</Text>
                                            <Text style={styles.detailLabel}>Avg EAR</Text>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <Text style={[styles.detailVal, { color: Colors.purple }]}>{session.avgMar.toFixed(2)}</Text>
                                            <Text style={styles.detailLabel}>Avg MAR</Text>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <Text style={[styles.detailVal, { color: Colors.rose }]}>{session.critical}</Text>
                                            <Text style={styles.detailLabel}>Critical Events</Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            <Text style={styles.expandHint}>{isOpen ? '▲ Less details' : '▼ More details'}</Text>
                        </TouchableOpacity>
                    );
                })}

                <View style={{ height: Spacing.xl }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.appBg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border },
    title: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
    filterBadge: { backgroundColor: Colors.cardBg, borderRadius: Radii.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 1, borderColor: Colors.border },
    filterText: { fontSize: Typography.sizes.xs, color: Colors.textSecondary },

    scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base },
    statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
    stat3: { flex: 1 },

    card: { backgroundColor: Colors.cardBg, borderRadius: Radii.xxl, padding: Spacing.base, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.base },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.base },
    cardTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.textPrimary },
    cardSub: { fontSize: Typography.sizes.xs, color: Colors.textSecondary, marginTop: 2 },
    dateBadge: { backgroundColor: Colors.panelBg, borderRadius: Radii.md, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
    dateBadgeText: { fontSize: Typography.sizes.xs, color: Colors.textSecondary },

    trendRow: { flexDirection: 'row', gap: Spacing.base, marginBottom: Spacing.base },
    trendItem: { flex: 1, gap: Spacing.xs },
    trendLabel: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold },
    trendFooter: { backgroundColor: Colors.warningBg, borderRadius: Radii.md, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.warningBorder },
    trendFooterText: { fontSize: Typography.sizes.xs, color: Colors.warning },

    sectionHeader: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },

    sessionCard: { backgroundColor: Colors.cardBg, borderRadius: Radii.xxl, padding: Spacing.base, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.base },
    sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.base },
    sessionDateBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    sessionDateIcon: { fontSize: 28 },
    sessionDate: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
    sessionTime: { fontSize: Typography.sizes.xs, color: Colors.textSecondary, marginTop: 2 },
    riskBadge: { borderRadius: Radii.full, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderWidth: 1 },
    riskBadgeText: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold },

    sessionQuickStats: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
    quickStat: { alignItems: 'center', gap: 2 },
    quickStatVal: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold },
    quickStatLabel: { fontSize: Typography.sizes.xs, color: Colors.textMuted },

    sessionDetails: { marginTop: Spacing.base, paddingTop: Spacing.base, borderTopWidth: 1, borderTopColor: Colors.border },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-around' },
    detailItem: { alignItems: 'center', gap: 4 },
    detailVal: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
    detailLabel: { fontSize: Typography.sizes.xs, color: Colors.textMuted },

    expandHint: { textAlign: 'center', fontSize: Typography.sizes.xs, color: Colors.textMuted, marginTop: Spacing.sm },
});
