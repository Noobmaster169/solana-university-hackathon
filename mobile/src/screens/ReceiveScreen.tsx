import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { RootStackParamList } from '../navigation/AppNavigator';

type ReceiveScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Receive'
>;
type ReceiveScreenRouteProp = RouteProp<RootStackParamList, 'Receive'>;

interface Props {
  navigation: ReceiveScreenNavigationProp;
  route: ReceiveScreenRouteProp;
}

export default function ReceiveScreen({ route }: Props) {
  const { vaultAddress } = route.params;

  const handleCopyAddress = () => {
    // In React Native, we'd use Clipboard API
    // For now, show alert
    Alert.alert('Address', vaultAddress, [
      {
        text: 'OK',
      },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Send SOL to my Keystore wallet:\n${vaultAddress}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Receive SOL</Text>
        <Text style={styles.description}>
          Scan this QR code or share your address to receive SOL
        </Text>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <QRCode value={vaultAddress} size={250} />
        </View>

        {/* Address Display */}
        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Your Vault Address</Text>
          <Text style={styles.address} numberOfLines={2}>
            {vaultAddress}
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleCopyAddress}>
          <Text style={styles.buttonText}>Copy Address</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleShare}>
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
            Share Address
          </Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 This is your vault address. Anyone can send SOL to this address,
            but only you can spend it with your biometrics.
          </Text>
        </View>

        {/* Network Info */}
        <View style={styles.networkInfo}>
          <Text style={styles.networkText}>Solana Devnet</Text>
        </View>
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
    alignItems: 'center',
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
    textAlign: 'center',
    marginBottom: 32,
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
  addressContainer: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  addressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  address: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#6200EE',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6200EE',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#6200EE',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  networkInfo: {
    marginTop: 16,
  },
  networkText: {
    fontSize: 12,
    color: '#999',
  },
});

