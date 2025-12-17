import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import 'react-native-get-random-values';
import { Buffer } from 'buffer';

// Polyfill Buffer for Solana
global.Buffer = Buffer;

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#6200EE" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}
