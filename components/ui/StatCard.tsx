import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, Radii } from '../../constants/typography';

interface StatCardProps {
    title: string;
    value: string;
    subtitle?: string;
    accentColor?: string;
    icon?: React.ReactNode;
    style?: ViewStyle;
}

export function StatCard({ title, value, subtitle, accentColor = Colors.blue, icon, style }: StatCardProps) {
    return (
        <View style={[styles.card, style]}>
            {/* Top accent line */}
            <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

            <View style={styles.row}>
                <Text style={styles.title}>{title}</Text>
                {icon && (
                    <View style={[styles.iconBox, { backgroundColor: accentColor + '22' }]}>
                        {icon}
                    </View>
                )}
            </View>

            <Text style={[styles.value, { color: Colors.textPrimary }]}>{value}</Text>

            {subtitle && (
                <Text style={[styles.subtitle, { color: accentColor }]}>{subtitle}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.cardBg,
        borderRadius: Radii.xl,
        padding: Spacing.base,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        flex: 1,
    },
    accentBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: Radii.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
        fontWeight: Typography.weights.medium,
        flex: 1,
    },
    value: {
        fontSize: Typography.sizes.xxl,
        fontWeight: Typography.weights.bold,
        marginBottom: Spacing.xs,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.semibold,
    },
});
