import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radii } from '../../constants/typography';

interface MetricGaugeProps {
    label: string;
    value: number;
    maxValue: number;
    warningThreshold: number;
    criticalThreshold: boolean; // true if low is bad (EAR), false if high is bad (MAR)
    unit?: string;
    style?: ViewStyle;
}

export function MetricGauge({
    label, value, maxValue, warningThreshold, criticalThreshold, unit = '', style
}: MetricGaugeProps) {
    const pct = Math.min((value / maxValue) * 100, 100);

    // For EAR: low value = danger. For MAR: high value = danger.
    const isEAR = criticalThreshold; // EAR: lower is worse
    let barColor = Colors.safe;
    if (isEAR) {
        if (value < 0.20) barColor = Colors.critical;
        else if (value < 0.25) barColor = Colors.warning;
        else barColor = Colors.safe;
    } else {
        if (value > 0.60) barColor = Colors.critical;
        else if (value > 0.50) barColor = Colors.warning;
        else barColor = Colors.safe;
    }

    return (
        <View style={[styles.container, style]}>
            <View style={styles.row}>
                <Text style={styles.label}>{label}</Text>
                <Text style={[styles.value, { color: barColor }]}>
                    {value.toFixed(3)}{unit}
                </Text>
            </View>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: Spacing.xs,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
        fontWeight: Typography.weights.medium,
    },
    value: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.bold,
        fontVariant: ['tabular-nums'],
        letterSpacing: 0.5,
    },
    track: {
        height: 6,
        backgroundColor: Colors.border,
        borderRadius: Radii.full,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: Radii.full,
    },
});
