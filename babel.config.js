module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        // NOTE: No need to add 'react-native-reanimated/plugin' here.
        // Since Expo SDK 54+, babel-preset-expo automatically configures
        // the react-native-worklets Babel plugin when reanimated is installed.
    };
};
