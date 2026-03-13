import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radii } from '../../constants/typography';

interface ToastProps {
    message: string;
    type: 'success' | 'info' | 'error';
    visible: boolean;
}

export function Toast({ message, type, visible }: ToastProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 100, friction: 10 }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: 40, duration: 250, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    const bgColors = { success: Colors.safe, info: Colors.blue, error: Colors.critical };
    const icons = { success: '✓', info: 'ℹ', error: '✕' };

    return (
        <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]}>
            <View style={[styles.iconBox, { backgroundColor: bgColors[type] + '33' }]}>
                <Text style={[styles.icon, { color: bgColors[type] }]}>{icons[type]}</Text>
            </View>
            <Text style={styles.message}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        right: 24,
        backgroundColor: Colors.cardBg,
        borderRadius: Radii.full,
        borderWidth: 1,
        borderColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        gap: Spacing.sm,
        zIndex: 999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
    },
    iconBox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.bold,
    },
    message: {
        color: Colors.textPrimary,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
        flex: 1,
    },
});
