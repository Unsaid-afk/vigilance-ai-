import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radii } from '../../constants/typography';

type Mood = 'Tired' | 'Drowsy' | 'Alert' | 'Energized';

const MOODS: { id: Mood; emoji: string; color: string; bg: string }[] = [
    { id: 'Tired', emoji: '😩', color: Colors.amber, bg: Colors.warningBg },
    { id: 'Drowsy', emoji: '😴', color: Colors.critical, bg: Colors.criticalBg },
    { id: 'Alert', emoji: '😊', color: Colors.safe, bg: Colors.safeBg },
    { id: 'Energized', emoji: '⚡', color: Colors.blue, bg: '#0EA5E915' },
];

const PLAYLISTS = [
    { id: 1, title: 'Wake Up Mix', desc: 'High-energy beats to boost alertness', tracks: 25, duration: '1h 45m', energy: 85 },
    { id: 2, title: 'Drive Pump Up', desc: 'Intense tracks for maximum focus', tracks: 30, duration: '2h 10m', energy: 90 },
    { id: 3, title: 'Electronic Energy', desc: 'Upbeat electronic for mental sharpness', tracks: 20, duration: '1h 30m', energy: 88 },
];

const RECENT = [
    { id: 1, title: 'Wake Up Mix', stats: '12 plays  •  2 hours ago', liked: true },
    { id: 2, title: 'Drive Pump Up', stats: '8 plays   •  Yesterday', liked: true },
    { id: 3, title: 'Focus Drive', stats: '15 plays  •  3 days ago', liked: false },
    { id: 4, title: 'Emergency Alertness', stats: '5 plays   •  1 week ago', liked: true },
];

export default function MusicTab() {
    const [mood, setMood] = useState<Mood>('Tired');
    const [playing, setPlaying] = useState<number | null>(null);
    const [liked, setLiked] = useState<Record<number, boolean>>({ 1: true, 2: true, 4: true });
    const soundRef = useRef<any | null>(null);
    const activeMood = MOODS.find(m => m.id === mood)!;

    useEffect(() => {
        return () => {
            soundRef.current?.unloadAsync();
        };
    }, []);

    const togglePlay = async (id: number) => {
        let Audio: any = null;
        try { Audio = require('expo-av').Audio; } catch (e) {}
        
        if (!Audio?.Sound) {
            console.warn('[Music] Audio module not available');
            return;
        }
        if (playing === id) {
            await soundRef.current?.stopAsync();
            setPlaying(null);
        } else {
            try {
                if (soundRef.current) {
                    await soundRef.current.unloadAsync();
                }
                const { sound } = await Audio.Sound.createAsync(
                    require('../../assets/sounds/alert_warning.mp3'), // Placeholder track
                    { shouldPlay: true, isLooping: true, volume: 0.5 }
                );
                soundRef.current = sound;
                setPlaying(id);
            } catch (e) {}
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── HERO ── */}
                <View style={[styles.hero, { borderColor: activeMood.color + '44', backgroundColor: activeMood.bg }]}>
                    <View style={[styles.heroIcon, { backgroundColor: activeMood.color }]}>
                        <Text style={{ fontSize: 28 }}>✨</Text>
                    </View>
                    <View style={styles.heroText}>
                        <Text style={styles.heroTitle}>AI Music Assistant</Text>
                        <Text style={styles.heroSub}>
                            Mood: <Text style={{ color: activeMood.color, fontWeight: '700' }}>{mood}</Text>
                        </Text>
                    </View>
                    <TouchableOpacity style={[styles.aiBtn, { backgroundColor: activeMood.color }]} activeOpacity={0.8}>
                        <Text style={styles.aiBtnText}>✨ Generate</Text>
                    </TouchableOpacity>
                </View>

                {/* ── MOOD SELECTOR ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Select Your Mood</Text>
                    <View style={styles.moodGrid}>
                        {MOODS.map(m => {
                            const active = mood === m.id;
                            return (
                                <TouchableOpacity
                                    key={m.id}
                                    style={[styles.moodBtn, active && { backgroundColor: m.bg, borderColor: m.color }]}
                                    onPress={() => setMood(m.id)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                                    <Text style={[styles.moodLabel, active && { color: m.color }]}>{m.id}</Text>
                                    {active && <View style={[styles.moodActiveDot, { backgroundColor: m.color }]} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ── AI-CURATED PLAYLISTS ── */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <View>
                            <Text style={styles.cardTitle}>Recommended Playlists</Text>
                            <Text style={styles.cardSub}>AI-curated for your {mood.toLowerCase()} state</Text>
                        </View>
                        <View style={[styles.aiTag, { borderColor: activeMood.color, backgroundColor: activeMood.bg }]}>
                            <Text style={[styles.aiTagText, { color: activeMood.color }]}>✨ AI</Text>
                        </View>
                    </View>
                    {PLAYLISTS.map(p => (
                        <TouchableOpacity
                            key={p.id}
                            style={styles.playlistRow}
                            onPress={() => togglePlay(p.id)}
                            activeOpacity={0.85}
                        >
                            <View style={[styles.playlistIcon, { backgroundColor: activeMood.color }]}>
                                <Text style={{ fontSize: 20 }}>🎵</Text>
                            </View>
                            <View style={styles.playlistInfo}>
                                <Text style={styles.playlistTitle}>{p.title}</Text>
                                <Text style={styles.playlistDesc}>{p.desc}</Text>
                                <View style={styles.playlistMeta}>
                                    <Text style={styles.playlistMetaText}>🎵 {p.tracks} tracks  •  🕐 {p.duration}</Text>
                                </View>
                            </View>
                            <View style={styles.playlistRight}>
                                <Text style={[styles.energyPct, { color: activeMood.color }]}>{p.energy}%</Text>
                                <Text style={styles.energyLabel}>⚡ Energy</Text>
                                <Text style={styles.playBtnText}>{playing === p.id ? '⏸' : '▶'}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── RECENTLY PLAYED ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Recently Played</Text>
                    {RECENT.map(track => (
                        <View key={track.id} style={styles.trackRow}>
                            <View style={styles.trackIcon}>
                                <Text style={{ fontSize: 20 }}>🎵</Text>
                            </View>
                            <View style={styles.trackInfo}>
                                <Text style={styles.trackTitle}>{track.title}</Text>
                                <Text style={styles.trackStats}>{track.stats}</Text>
                            </View>
                            <View style={styles.trackActions}>
                                <TouchableOpacity onPress={() => setLiked(l => ({ ...l, [track.id]: !l[track.id] }))}>
                                    <Text style={{ fontSize: 20 }}>{liked[track.id] ? '❤️' : '🤍'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Text style={{ fontSize: 20 }}>▶</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={{ height: Spacing.xl }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.appBg },
    scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base },

    hero: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
        borderRadius: Radii.xxl, padding: Spacing.base, borderWidth: 1,
        marginBottom: Spacing.base,
    },
    heroIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    heroText: { flex: 1 },
    heroTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
    heroSub: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
    aiBtn: { borderRadius: Radii.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
    aiBtnText: { color: '#fff', fontWeight: Typography.weights.bold, fontSize: Typography.sizes.sm },

    card: { backgroundColor: Colors.cardBg, borderRadius: Radii.xxl, padding: Spacing.base, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.base },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.base },
    cardTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: Colors.textPrimary, marginBottom: Spacing.base },
    cardSub: { fontSize: Typography.sizes.xs, color: Colors.textSecondary, marginTop: 2 },
    aiTag: { borderRadius: Radii.full, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderWidth: 1 },
    aiTagText: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold },

    moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    moodBtn: {
        flex: 1, minWidth: '45%', alignItems: 'center', justifyContent: 'center',
        paddingVertical: Spacing.base, borderRadius: Radii.xl,
        borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.panelBg,
        gap: Spacing.xs, position: 'relative',
    },
    moodEmoji: { fontSize: 28 },
    moodLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: Colors.textSecondary },
    moodActiveDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4 },

    playlistRow: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
        paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    playlistIcon: { width: 48, height: 48, borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center' },
    playlistInfo: { flex: 1, gap: 2 },
    playlistTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
    playlistDesc: { fontSize: Typography.sizes.xs, color: Colors.textSecondary },
    playlistMeta: { marginTop: 2 },
    playlistMetaText: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
    playlistRight: { alignItems: 'center', gap: 2 },
    energyPct: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold },
    energyLabel: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
    playBtnText: { fontSize: 20, marginTop: 4 },

    trackRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
    trackIcon: { width: 44, height: 44, borderRadius: Radii.md, backgroundColor: '#4F1D96', alignItems: 'center', justifyContent: 'center' },
    trackInfo: { flex: 1, gap: 2 },
    trackTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.textPrimary },
    trackStats: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
    trackActions: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
});
