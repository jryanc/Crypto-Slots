import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LogBox } from 'react-native';

// Redux store
import store from './store';

// Navigation
import Navigation from './navigation';

// Auth context
import { AuthProvider } from './contexts/AuthContext';

// Theme
import { ThemeProvider } from './contexts/ThemeContext';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Reanimated 2',
  'AsyncStorage has been extracted',
  'Non-serializable values were found in the navigation state',
]);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  // Load any resources or data needed prior to rendering the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          ...FontAwesome5.font,
          ...MaterialCommunityIcons.font,
          'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
          'casino': require('./assets/fonts/Casino.ttf'),
          'neon': require('./assets/fonts/Neon.ttf'),
        });

        // Load images
        await Asset.loadAsync([
          require('./assets/images/slot-machine.png'),
          require('./assets/images/crypto-logo.png'),
          require('./assets/images/splash.png'),
          require('./assets/images/icon.png'),
        ]);

        // Load sounds
        // await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        // const spinSound = new Audio.Sound();
        // await spinSound.loadAsync(require('./assets/sounds/spin.mp3'));
        // const winSound = new Audio.Sound();
        // await winSound.loadAsync(require('./assets/sounds/win.mp3'));
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <ThemeProvider>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <Navigation />
            </NavigationContainer>
          </AuthProvider>
        </ThemeProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}