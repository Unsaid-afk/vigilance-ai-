import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/typography';

function TabIcon({ name, focused, emoji }: { name: string; focused: boolean; emoji: string }) {
    return (
        <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
            <Text style={styles.emoji}>{emoji}</Text>
            {focused && <Text style={[styles.label, { color: Colors.blue }]}>{name}</Text>}
        </View>
    );
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
                tabBarActiveTintColor: Colors.blue,
                tabBarInactiveTintColor: Colors.textMuted,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon name="Dashboard" focused={focused} emoji="📊" />,
                }}
            />
            <Tabs.Screen
                name="monitor"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon name="Monitor" focused={focused} emoji="🎥" />,
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon name="History" focused={focused} emoji="📋" />,
                }}
            />
            <Tabs.Screen
                name="music"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon name="Music AI" focused={focused} emoji="🎵" />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon name="Settings" focused={focused} emoji="⚙️" />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: Colors.cardBg,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        height: Platform.OS === 'ios' ? 85 : 65,
        paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        paddingTop: 8,
    },
    iconWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 50,
        gap: 2,
    },
    iconWrapActive: {
        backgroundColor: Colors.blue + '18',
    },
    emoji: {
        fontSize: 20,
    },
    label: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.semibold,
    },
});
