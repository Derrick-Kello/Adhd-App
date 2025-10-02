import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useGameStore } from '../src/store/gameStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loadGameData = useGameStore(state => state.loadGameData);

  useEffect(() => {
    const initializeApp = async () => {
      await loadGameData();
      await SplashScreen.hideAsync();
    };
    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="home" />
          <Stack.Screen name="games/matching" />
          <Stack.Screen name="games/tracing" />
          <Stack.Screen name="games/tapping" />
          <Stack.Screen name="games/focus" />
          <Stack.Screen name="games/breathing" />
          <Stack.Screen name="movement" />
          <Stack.Screen name="rewards" />
          <Stack.Screen name="parent" />
        </Stack>
        <StatusBar style="light" backgroundColor="#4A90E2" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
