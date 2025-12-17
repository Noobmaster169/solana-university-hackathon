import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import QRCode from 'react-native-qrcode-svg';
import { RootStackParamList } from '../navigation/AppNavigator';
import { KeystoreSDK } from '../sdk';

type AddDeviceScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AddDevice'
>;

interface Props {
  navigation: AddDeviceScreenNavigationProp;
}

export default function AddDeviceScreen({ navigation }: Props) {
  const [mode, setMode] = useState<'generate' | 'scan'>('generate');
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(false);

  const sdk = new KeystoreSDK({
    rpcUrl: 'https://api.devnet.solana.com',
  });

  const handleGenerateQR = async () => {
    try {
      const wallet = await sdk.getWallet();
      if (!wallet) {
        Alert.alert('Error', 'Wallet not found');
        return;
      }

      // Generate QR data with identity and instructions
      const data = JSON.stringify({
        type: 'add-device',
        identity: wallet.identity.toBase58(),
        instructions: 'Scan this QR code with your backup device',
      });

      setQrData(data);
      setMode('generate');
    } catch (error) {
      console.error('Error generating QR:', error);
      Alert.alert('Error', 'Failed to generate QR code');
    }
  };

  const handleScanQR = () => {
    // In a real implementation, this would open the camera
    // For now, show a placeholder
    Alert.alert(
      'QR Scanner',
      'Camera scanner would open here.\n\nFor demo purposes, use two physical devices:\n1. Generate QR on existing device\n2. Scan QR on new device',
      [
        {
          text: 'OK',
        },
      ]
    );
  };

  React.useEffect(() => {
    handleGenerateQR();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Add Backup Device</Text>
        <Text style={styles.description}>
          Add another device to your wallet for recovery and multi-sig
          transactions
        </Text>

        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'generate' && styles.modeButtonActive,
            ]}
            onPress={handleGenerateQR}>
            <Text
              style={[
                styles.modeButtonText,
                mode === 'generate' && styles.modeButtonTextActive,
              ]}>
              Generate QR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'scan' && styles.modeButtonActive,
            ]}
            onPress={() => setMode('scan')}>
            <Text
              style={[
                styles.modeButtonText,
                mode === 'scan' && styles.modeButtonTextActive,
              ]}>
              Scan QR
            </Text>
          </TouchableOpacity>
        </View>

        {/* Generate Mode */}
        {mode === 'generate' && qrData && (
          <View style={styles.generateMode}>
            <View style={styles.qrContainer}>
              <QRCode value={qrData} size={250} />
            </View>

            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>📱 Instructions</Text>
              <Text style={styles.instructionsText}>
                1. Open Keystore app on your backup device{'\n'}
                2. Go to Settings → Add Backup Device{'\n'}
                3. Tap "Scan QR" and scan this code{'\n'}
                4. Authenticate with biometrics on both devices
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 This QR code contains your identity address. The backup
                device will create its own biometric key and register it to your
                wallet.
              </Text>
            </View>
          </View>
        )}

        {/* Scan Mode */}
        {mode === 'scan' && (
          <View style={styles.scanMode}>
            <View style={styles.scanPlaceholder}>
              <Text style={styles.scanPlaceholderText}>📷</Text>
              <Text style={styles.scanPlaceholderLabel}>Camera View</Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleScanQR}>
              <Text style={styles.buttonText}>Open Camera Scanner</Text>
            </TouchableOpacity>

            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>📱 Instructions</Text>
              <Text style={styles.instructionsText}>
                1. Point camera at the QR code from your primary device{'\n'}
                2. The app will automatically detect and scan{'\n'}
                3. Authenticate with biometrics to complete setup{'\n'}
                4. Your backup device will be registered
              </Text>
            </View>
          </View>
        )}

        {/* Benefits Section */}
        <View style={styles.benefits}>
          <Text style={styles.benefitsTitle}>Why Add a Backup Device?</Text>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>🔐</Text>
            <Text style={styles.benefitText}>
              Recover access if you lose your primary device
            </Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>✅</Text>
            <Text style={styles.benefitText}>
              Enable multi-sig for high-value transactions
            </Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>📱</Text>
            <Text style={styles.benefitText}>
              Use your wallet from multiple devices
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 24,
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: '#6200EE',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  generateMode: {
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scanMode: {
    alignItems: 'center',
  },
  scanPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scanPlaceholderText: {
    fontSize: 64,
    marginBottom: 16,
  },
  scanPlaceholderLabel: {
    fontSize: 18,
    color: '#666',
  },
  button: {
    width: '100%',
    backgroundColor: '#6200EE',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    width: '100%',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  benefits: {
    width: '100%',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

