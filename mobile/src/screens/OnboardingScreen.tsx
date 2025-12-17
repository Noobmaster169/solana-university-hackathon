import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { KeystoreSDK } from '../sdk';

type OnboardingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

export default function OnboardingScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const sdk = new KeystoreSDK({
    rpcUrl: 'https://api.devnet.solana.com',
  });

  useEffect(() => {
    checkWalletAndBiometric();
  }, []);

  const checkWalletAndBiometric = async () => {
    try {
      // Check if wallet exists
      const hasWallet = await sdk.hasWallet();
      if (hasWallet) {
        navigation.replace('Dashboard');
        return;
      }

      // Check biometric availability
      const available = await sdk.isBiometricAvailable();
      setBiometricAvailable(available);
    } catch (error) {
      console.error('Error checking wallet/biometric:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Keystore</Text>
        <Text style={styles.subtitle}>Biometric Solana Wallet</Text>

        <View style={styles.features}>
          <Feature
            icon="🔐"
            title="No Seed Phrases"
            description="Your fingerprint or face is your wallet"
          />
          <Feature
            icon="📱"
            title="Multi-Device"
            description="Add backup devices for recovery"
          />
          <Feature
            icon="⚡"
            title="Gasless"
            description="No transaction fees to worry about"
          />
        </View>

        {!biometricAvailable && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              ⚠️ Biometric authentication not available on this device
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, !biometricAvailable && styles.buttonDisabled]}
          onPress={() => navigation.navigate('CreateWallet')}
          disabled={!biometricAvailable}>
          <Text style={styles.buttonText}>Create Wallet</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Powered by Solana secp256r1 precompile
        </Text>
      </View>
    </View>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.feature}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6200EE',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  features: {
    marginBottom: 48,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  warning: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  warningText: {
    color: '#856404',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6200EE',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    marginTop: 24,
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
  },
});

