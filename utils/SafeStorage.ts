const memoryStorage: Record<string, string | null> = {};

const SafeStorage = {
    getItem: async (key: string) => {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            return await AsyncStorage.getItem(key);
        } catch (e) {
            console.warn(`[SafeStorage] Memory Fallback GET: ${key}`);
            return memoryStorage[key] || null;
        }
    },
    setItem: async (key: string, value: string) => {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            await AsyncStorage.setItem(key, value);
        } catch (e) {
            console.warn(`[SafeStorage] Memory Fallback SET: ${key}`);
            memoryStorage[key] = value;
        }
    },
    removeItem: async (key: string) => {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.warn(`[SafeStorage] Memory Fallback REMOVE: ${key}`);
            delete memoryStorage[key];
        }
    }
};

export default SafeStorage;
