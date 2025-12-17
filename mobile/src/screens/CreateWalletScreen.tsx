import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { KeystoreSDK } from '../sdk';

type CreateWalletScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CreateWallet'
>;

interface Props {
  navigation: CreateWalletScreenNavigationProp;
}

export default function CreateWalletScreen({ navigation }: Props) {
  const [deviceName, setDeviceName] = useState(getDefaultDeviceName());
  const [creating, setCreating] = useState(false);

  const sdk = new KeystoreSDK({
    rpcUrl: 'https://api.devnet.solana.com',
  });

  const handleCreateWallet = async () => {
    if (!deviceName.trim()) {
      Alert.alert('Error', 'Please enter a device name');
      return;
    }

    setCreating(true);
    try {
      const result = await sdk.createWallet(deviceName.trim());
      
      Alert.alert(
        'Success!',
        `Wallet created successfully!\n\nIdentity: ${result.identity.toBase58().slice(0, 8)}...`,
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Dashboard'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating wallet:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create wallet. Please try again.'
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Your Wallet</Text>
        <Text style={styles.description}>
          Your wallet will be protected by biometric authentication.
          {'\n\n'}
          You'll need to authenticate with your fingerprint or face to create
          the wallet and sign transactions.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Device Name</Text>
          <TextInput
            style={styles.input}
            value={deviceName}
            onChangeText={setDeviceName}
            placeholder="e.g., My Phone"
            placeholderTextColor="#999"
            editable={!creating}
          />
          <Text style={styles.hint}>
            This helps you identify this device when managing multiple devices
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, creating && styles.buttonDisabled]}
          onPress={handleCreateWallet}
          disabled={creating}>
          {creating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              Create Wallet with Biometrics
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🔐 Security Note</Text>
          <Text style={styles.infoText}>
            • Your private key never leaves this device{'\n'}
            • Stored in hardware-backed secure storage{'\n'}
            • Only accessible with your biometrics{'\n'}
            • Add backup devices for recovery
          </Text>
        </View>
      </View>
    </View>
  );
}

function getDefaultDeviceName(): string {
  const model = Platform.select({
    android: 'Android Device',
    ios: 'iOS Device',
    default: 'My Device',
  });
  return model;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#6200EE',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

