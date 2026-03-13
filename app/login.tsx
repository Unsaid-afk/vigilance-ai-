import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, Animated,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import SafeStorage from '../utils/SafeStorage';
import { Colors } from '../constants/Colors';
import { Typography, Spacing, Radii } from '../constants/typography';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('john.doe@vigilance.ai');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const pulse = () => {
        Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter email and password.');
            shake();
            return;
        }
        setError('');
        setLoading(true);
        pulse();
        // Simulate auth — replace with real auth if needed
        await new Promise(r => setTimeout(r, 800));
        await SafeStorage.setItem('vigilance_logged_in', 'true');
        setLoading(false);
        router.replace('/(tabs)');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

                {/* Background glow blobs */}
                <View style={styles.blobTopLeft} pointerEvents="none" />
                <View style={styles.blobBotRight} pointerEvents="none" />

                {/* Logo */}
                <View style={styles.logoSection}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoIcon}>⚡</Text>
                    </View>
                    <Text style={styles.appName}>
                        VIGILANCE<Text style={styles.appNameAccent}>.AI</Text>
                    </Text>
                    <Text style={styles.tagline}>Driver Safety Intelligence System</Text>
                </View>

                {/* Card */}
                <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
                    {/* top accent */}
                    <View style={styles.cardAccent} />

                    <Text style={styles.cardTitle}>Sign In</Text>
                    <Text style={styles.cardSubtitle}>Access your monitoring dashboard</Text>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputIcon}>✉</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor={Colors.textMuted}
                                placeholder="Enter your email"
                                selectionColor={Colors.blue}
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <View style={styles.inputLabelRow}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <Text style={styles.forgotText}>Forgot password?</Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputIcon}>🔒</Text>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                placeholderTextColor={Colors.textMuted}
                                placeholder="••••••••"
                                selectionColor={Colors.blue}
                            />
                        </View>
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {/* Sign In Button */}
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <TouchableOpacity
                            style={[styles.loginBtn, loading && styles.loginBtnLoading]}
                            onPress={handleLogin}
                            activeOpacity={0.85}
                            disabled={loading}
                        >
                            <Text style={styles.loginBtnText}>
                                {loading ? 'Signing In...' : 'Access Dashboard →'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Feature pills */}
                    <View style={styles.pillsRow}>
                        {['🔒 Secure', '⚡ Edge AI', '📊 Real-time'].map(p => (
                            <View key={p} style={styles.pill}>
                                <Text style={styles.pillText}>{p}</Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                <Text style={styles.footer}>Vigilance AI • Driver Safety System</Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.appBg,
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: Spacing.xl,
        minHeight: height,
    },
    blobTopLeft: {
        position: 'absolute',
        top: -80,
        left: -80,
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: 'rgba(14,165,233,0.08)',
    },
    blobBotRight: {
        position: 'absolute',
        bottom: -60,
        right: -60,
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: 'rgba(168,85,247,0.07)',
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: Spacing.xxxl,
    },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: Colors.blue,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.base,
        shadowColor: Colors.blue,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 12,
    },
    logoIcon: { fontSize: 32 },
    appName: {
        fontSize: Typography.sizes.xxl,
        fontWeight: Typography.weights.black,
        color: Colors.textPrimary,
        letterSpacing: 3,
        marginBottom: Spacing.xs,
    },
    appNameAccent: { color: Colors.blue },
    tagline: {
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: Colors.cardBg,
        borderRadius: Radii.xxl,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 16,
    },
    cardAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: Colors.blue,
    },
    cardTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
        marginTop: Spacing.xs,
    },
    cardSubtitle: {
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.xl,
    },
    inputGroup: {
        marginBottom: Spacing.base,
    },
    inputLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    inputLabel: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    forgotText: {
        fontSize: Typography.sizes.xs,
        color: Colors.blue,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBg,
        borderRadius: Radii.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: Platform.OS === 'ios' ? Spacing.md : 2,
    },
    inputIcon: {
        fontSize: 16,
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: Typography.sizes.base,
        color: Colors.textPrimary,
        paddingVertical: Spacing.sm,
    },
    errorText: {
        color: Colors.critical,
        fontSize: Typography.sizes.sm,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    loginBtn: {
        backgroundColor: Colors.blue,
        borderRadius: Radii.lg,
        paddingVertical: Spacing.base,
        alignItems: 'center',
        marginTop: Spacing.sm,
        shadowColor: Colors.blue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    },
    loginBtnLoading: {
        opacity: 0.75,
    },
    loginBtnText: {
        color: '#fff',
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.bold,
        letterSpacing: 0.5,
    },
    pillsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.lg,
    },
    pill: {
        backgroundColor: Colors.panelBg,
        borderRadius: Radii.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    pillText: {
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
    },
    footer: {
        textAlign: 'center',
        color: Colors.textMuted,
        fontSize: Typography.sizes.xs,
        marginTop: Spacing.xl,
        letterSpacing: 0.5,
    },
});
