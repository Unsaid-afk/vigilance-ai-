import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import SafeStorage from '../utils/SafeStorage';
import { useRouter, useRootNavigationState, useSegments } from 'expo-router';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
    const router = useRouter();
    const rootNavigationState = useRootNavigationState();
    const segments = useSegments();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!rootNavigationState?.key) return;

        let resolved = false;

        SafeStorage.getItem('vigilance_logged_in')
            .then(val => {
                if (resolved) return;
                resolved = true;
                setIsReady(true);

                const isLoggedIn = val === 'true';
                const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'drive-mode';

                if (!isLoggedIn && (segments[0] === '(tabs)' || segments[0] === 'drive-mode')) {
                    // Redirect to login if not logged in but trying to access protected pages
                    router.replace('/login');
                } else if (isLoggedIn && segments[0] === 'login') {
                    // Redirect to dashboard if already logged in but visiting login page
                    router.replace('/(tabs)');
                } else if (!isLoggedIn && !segments[0]) {
                    // Default to login on fresh start if no route and not logged in
                    router.replace('/login');
                }
                // If already logged in and on a valid route (like /monitor), stay there!
            })
            .catch(() => {
                if (resolved) return;
                resolved = true;
                setIsReady(true);
                router.replace('/login');
            });

        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                setIsReady(true);
                // Fallback only if no route is matching
                if (!segments[0]) router.replace('/login');
            }
        }, 2000);

    }, [rootNavigationState?.key, segments]);

    if (!rootNavigationState?.key || !isReady) {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.appBg, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.blue} />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={styles.root}>
            <StatusBar style="light" backgroundColor="#050A14" />
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
                <Stack.Screen name="login" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="drive-mode" options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }} />
            </Stack>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
});
