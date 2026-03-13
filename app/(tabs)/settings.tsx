import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SafeStorage from '../../utils/SafeStorage';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radii } from '../../constants/typography';
import { Toast } from '../../components/ui/Toast';
import { DEFAULT_SETTINGS, AppSettings } from '../../hooks/useSettings';

function SliderRow({
    label, value, min, max, step, accentColor = Colors.blue,
    onDecrease, onIncrease,
}: {
    label: string; value: number; min: number; max: number; step: number;
    accentColor?: string; onDecrease: () => void; onIncrease: () => void;
}) {
    const pct = ((value - min) / (max - min)) * 100;
    return (
        <View style={sliderStyles.wrapper}>
            <View style={sliderStyles.labelRow}>
                <Text style={sliderStyles.label}>{label}</Text>
                <Text style={[sliderStyles.val, { color: accentColor }]}>{value.toFixed(2)}</Text>
            </View>
            <View style={sliderStyles.track}>
                <View style={[sliderStyles.fill, { width: `${pct}%`, backgroundColor: accentColor }]} />
            </View>
            <View style={sliderStyles.btnRow}>
                <TouchableOpacity style={sliderStyles.btn} onPress={onDecrease} activeOpacity={0.7}>
                    <Text style={sliderStyles.btnText}>−</Text>
                </TouchableOpacity>
                <Text style={sliderStyles.range}>{min.toFixed(2)} – {max.toFixed(2)}</Text>
                <TouchableOpacity style={sliderStyles.btn} onPress={onIncrease} activeOpacity={0.7}>
                    <Text style={sliderStyles.btnText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function SettingsTab() {
    const router = useRouter();
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error'; show: boolean }>({ msg: '', type: 'success', show: false });

    useEffect(() => {
        SafeStorage.getItem('vigilance_settings').then(v => {
            if (v) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(v) });
        });
    }, []);

    function showToast(msg: string, type: 'success' | 'info' | 'error' = 'success') {
        setToast({ msg, type, show: true });
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
    }

    function update(key: keyof AppSettings, value: any) {
        setSettings(s => ({ ...s, [key]: value }));
    }

    function adjust(key: keyof AppSettings, delta: number, min: number, max: number, step: number) {
        setSettings(s => {
            const current = s[key] as number;
            const next = Math.min(max, Math.max(min, parseFloat((current + delta).toFixed(2))));
            return { ...s, [key]: next };
        });
    }

    async function saveSettings() {
        await SafeStorage.setItem('vigilance_settings', JSON.stringify(settings));
        showToast('Settings saved successfully!', 'success');
    }

    async function resetDefaults() {
        setSettings(DEFAULT_SETTINGS);
        await SafeStorage.setItem('vigilance_settings', JSON.stringify(DEFAULT_SETTINGS));
        showToast('Reset to default settings', 'info');
    }

    async function handleLogout() {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out', style: 'destructive',
                onPress: async () => {
                    await SafeStorage.removeItem('vigilance_logged_in');
                    router.replace('/login');
                },
            },
        ]);
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
                <View style={styles.saveBtnRow}>
                    <TouchableOpacity style={styles.resetBtn} onPress={resetDefaults} activeOpacity={0.8}>
                        <Text style={styles.resetBtnText}>↺ Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveBtn} onPress={saveSettings} activeOpacity={0.85}>
                        <Text style={styles.saveBtnText}>💾 Save</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── DETECTION SENSITIVITY ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIcon, { backgroundColor: Colors.blue + '22' }]}>
                            <Text>👁</Text>
                        </View>
                        <View>
                            <Text style={styles.sectionTitle}>Detection Sensitivity</Text>
                            <Text style={styles.sectionSub}>Adjust thresholds to minimize false alarms</Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.subGroupTitle}>👁 Eye Aspect Ratio (EAR) Thresholds</Text>
                        <SliderRow
                            label="Warning Level"
                            value={settings.earWarning}
                            min={0.10} max={0.40} step={0.01}
                            accentColor={Colors.warning}
                            onDecrease={() => adjust('earWarning', -0.01, 0.10, 0.40, 0.01)}
                            onIncrease={() => adjust('earWarning', +0.01, 0.10, 0.40, 0.01)}
                        />
                        <View style={styles.divider} />
                        <SliderRow
                            label="Critical Level"
                            value={settings.earCritical}
                            min={0.10} max={0.40} step={0.01}
                            accentColor={Colors.critical}
                            onDecrease={() => adjust('earCritical', -0.01, 0.10, 0.40, 0.01)}
                            onIncrease={() => adjust('earCritical', +0.01, 0.10, 0.40, 0.01)}
                        />
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.subGroupTitle}>😮 Mouth Aspect Ratio (MAR) Thresholds</Text>
                        <SliderRow
                            label="Warning Level"
                            value={settings.marWarning}
                            min={0.15} max={0.80} step={0.01}
                            accentColor={Colors.warning}
                            onDecrease={() => adjust('marWarning', -0.01, 0.15, 0.80, 0.01)}
                            onIncrease={() => adjust('marWarning', +0.01, 0.15, 0.80, 0.01)}
                        />
                        <View style={styles.divider} />
                        <SliderRow
                            label="Critical Level"
                            value={settings.marCritical}
                            min={0.15} max={0.80} step={0.01}
                            accentColor={Colors.critical}
                            onDecrease={() => adjust('marCritical', -0.01, 0.15, 0.80, 0.01)}
                            onIncrease={() => adjust('marCritical', +0.01, 0.15, 0.80, 0.01)}
                        />
                    </View>
                </View>

                {/* ── ALERT PREFERENCES ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIcon, { backgroundColor: Colors.amber + '22' }]}>
                            <Text>🔔</Text>
                        </View>
                        <View>
                            <Text style={styles.sectionTitle}>Alert Preferences</Text>
                            <Text style={styles.sectionSub}>Configure how you receive alerts</Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        {[
                            { key: 'soundAlerts', label: 'Sound Alerts', sub: 'Play audio when drowsiness detected', icon: '🔊' },
                            { key: 'vibrationAlerts', label: 'Vibration Alerts', sub: 'Haptic feedback on critical alerts', icon: '📳' },
                            { key: 'autoMusic', label: 'Auto Music AI', sub: 'Suggest energizing music when tired', icon: '🎵' },
                        ].map((item, i) => (
                            <View key={item.key}>
                                <View style={toggleStyles.row}>
                                    <Text style={toggleStyles.icon}>{item.icon}</Text>
                                    <View style={toggleStyles.text}>
                                        <Text style={toggleStyles.label}>{item.label}</Text>
                                        <Text style={toggleStyles.sub}>{item.sub}</Text>
                                    </View>
                                    <Switch
                                        value={settings[item.key as keyof AppSettings] as boolean}
                                        onValueChange={v => update(item.key as keyof AppSettings, v)}
                                        trackColor={{ false: Colors.border, true: Colors.blue + '88' }}
                                        thumbColor={settings[item.key as keyof AppSettings] ? Colors.blue : Colors.textMuted}
                                    />
                                </View>
                                {i < 2 && <View style={styles.divider} />}
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── ALERT LEVEL REFERENCE ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Alert Level System</Text>
                    <View style={styles.alertRefGrd}>
                        {[
                            { color: Colors.safe, label: '🟢 Safe', desc: 'Alert and focused. Normal monitoring' },
                            { color: Colors.warning, label: '🟡 Warning', desc: 'Early fatigue. Mild alerts issued' },
                            { color: Colors.critical, label: '🔴 Critical', desc: 'Severe drowsiness. Urgent alert' },
                        ].map(a => (
                            <View key={a.label} style={[styles.alertRefCard, { borderColor: a.color + '44', backgroundColor: a.color + '10' }]}>
                                <Text style={[styles.alertRefLabel, { color: a.color }]}>{a.label}</Text>
                                <Text style={styles.alertRefDesc}>{a.desc}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── ACCOUNT ── */}
                <View style={styles.card}>
                    <View style={styles.profileRow}>
                        <View style={styles.profileAvatar}>
                            <Text style={styles.profileAvatarText}>JD</Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>John Doe</Text>
                            <Text style={styles.profileEmail}>john.doe@vigilance.ai</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                        <Text style={styles.logoutText}>🚪  Sign Out</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: Spacing.xl }} />
            </ScrollView>

            <Toast message={toast.msg} type={toast.type} visible={toast.show} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.appBg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border },
    title: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
    saveBtnRow: { flexDirection: 'row', gap: Spacing.sm },
    resetBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radii.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.cardBg },
    resetBtnText: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: Typography.weights.medium },
    saveBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radii.lg, backgroundColor: Colors.blue, shadowColor: Colors.blue, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 6 },
    saveBtnText: { fontSize: Typography.sizes.sm, color: '#fff', fontWeight: Typography.weights.bold },

    scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base },
    section: { marginBottom: Spacing.lg },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
    sectionIcon: { width: 44, height: 44, borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
    sectionSub: { fontSize: Typography.sizes.xs, color: Colors.textSecondary, marginTop: 2 },

    card: { backgroundColor: Colors.cardBg, borderRadius: Radii.xxl, padding: Spacing.base, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
    subGroupTitle: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: Colors.textPrimary, marginBottom: Spacing.base },
    divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.base },

    alertRefGrd: { gap: Spacing.sm },
    alertRefCard: { borderRadius: Radii.lg, padding: Spacing.base, borderWidth: 1 },
    alertRefLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, marginBottom: 4 },
    alertRefDesc: { fontSize: Typography.sizes.xs, color: Colors.textSecondary },

    profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.base },
    profileAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.blue, alignItems: 'center', justifyContent: 'center' },
    profileAvatarText: { color: '#fff', fontWeight: Typography.weights.bold, fontSize: Typography.sizes.base },
    profileInfo: { flex: 1 },
    profileName: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
    profileEmail: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
    logoutBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
    logoutText: { fontSize: Typography.sizes.base, color: Colors.critical, fontWeight: Typography.weights.semibold },
});

const sliderStyles = StyleSheet.create({
    wrapper: { gap: Spacing.xs },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
    val: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
    track: { height: 6, backgroundColor: Colors.border, borderRadius: Radii.full, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: Radii.full },
    btnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    btn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.panelBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
    btnText: { fontSize: Typography.sizes.md, color: Colors.textPrimary, fontWeight: Typography.weights.bold },
    range: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
});

const toggleStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    icon: { fontSize: 22 },
    text: { flex: 1, gap: 2 },
    label: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: Colors.textPrimary },
    sub: { fontSize: Typography.sizes.xs, color: Colors.textSecondary },
});
