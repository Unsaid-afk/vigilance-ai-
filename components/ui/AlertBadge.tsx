import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, AlertLevel, getAlertColors } from '../../constants/Colors';
import { Typography, Spacing, Radii } from '../../constants/typography';

interface AlertBadgeProps {
    level: AlertLevel;
    size?: 'sm' | 'md' | 'lg';
}

export function AlertBadge({ level, size = 'md' }: AlertBadgeProps) {
    const { color, bg, border } = getAlertColors(level);

    const labels: Record<AlertLevel, string> = {
        Safe: '● SAFE',
        Warning: '⚠ WARNING',
        Critical: '⚠ CRITICAL',
    };

    const sizeStyles = {
        sm: { paddingHorizontal: Spacing.sm, paddingVertical: 3, fontSize: Typography.sizes.xs },
        md: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, fontSize: Typography.sizes.sm },
        lg: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, fontSize: Typography.sizes.base },
    };

    return (
        <View style={[
            styles.badge,
            { backgroundColor: bg, borderColor: border, paddingHorizontal: sizeStyles[size].paddingHorizontal, paddingVertical: sizeStyles[size].paddingVertical },
        ]}>
            <Text style={[styles.label, { color, fontSize: sizeStyles[size].fontSize }]}>
                {labels[level]}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        borderRadius: Radii.full,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    label: {
        fontWeight: Typography.weights.bold,
        letterSpacing: 0.8,
    },
});
