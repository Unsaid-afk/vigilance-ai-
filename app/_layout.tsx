import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import SafeStorage from '../utils/SafeStorage';
import { useRouter, useRootNavigationState } from 'expo-router';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
    const router = useRouter();
    const rootNavigationState = useRootNavigationState();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!rootNavigationState?.key) return;

        let resolved = false;

        SafeStorage.getItem('vigilance_logged_in')
            .then(val => {
                if (resolved) return;
                resolved = true;
                setIsReady(true);
                if (val === 'true') {
                    router.replace('/(tabs)');
                } else {
                    router.replace('/login');
                }
            })
            .catch(err => {
                if (resolved) return;
                resolved = true;
                setIsReady(true);
                router.replace('/login');
            });

        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                setIsReady(true);
                router.replace('/login');
            }
        }, 1500);

    }, [rootNavigationState?.key]);

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
