import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PublicKey } from '@solana/web3.js';

// Screens (will be created)
import OnboardingScreen from '../screens/OnboardingScreen';
import CreateWalletScreen from '../screens/CreateWalletScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SendScreen from '../screens/SendScreen';
import ReceiveScreen from '../screens/ReceiveScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddDeviceScreen from '../screens/AddDeviceScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  CreateWallet: undefined;
  Dashboard: undefined;
  Send: undefined;
  Receive: { vaultAddress: string };
  Settings: undefined;
  AddDevice: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200EE',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateWallet"
          component={CreateWalletScreen}
          options={{ title: 'Create Wallet' }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'Keystore Wallet', headerLeft: () => null }}
        />
        <Stack.Screen
          name="Send"
          component={SendScreen}
          options={{ title: 'Send SOL' }}
        />
        <Stack.Screen
          name="Receive"
          component={ReceiveScreen}
          options={{ title: 'Receive SOL' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
        <Stack.Screen
          name="AddDevice"
          component={AddDeviceScreen}
          options={{ title: 'Add Backup Device' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

