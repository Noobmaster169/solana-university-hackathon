import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { KeystoreSDK } from '../sdk';

type SettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Settings'
>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

export default function SettingsScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<Array<{ name: string; addedAt: number }>>([]);
  const [threshold, setThreshold] = useState(1);

  const sdk = new KeystoreSDK({
    rpcUrl: 'https://api.devnet.solana.com',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const identity = await sdk.getIdentityAccount();
      if (identity) {
        setDevices(
          identity.keys.map(k => ({
            name: k.name,
            addedAt: k.addedAt,
          }))
        );
        setThreshold(identity.threshold);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = () => {
    navigation.navigate('AddDevice');
  };

  const handleDeleteWallet = () => {
    Alert.alert(
      'Delete Wallet',
      'Are you sure you want to delete this wallet from this device?\n\nMake sure you have backup devices configured!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await sdk.deleteWallet();
              navigation.replace('Onboarding');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete wallet');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Devices Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registered Devices</Text>
          {devices.map((device, index) => (
            <View key={index} style={styles.deviceItem}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceDate}>
                  Added {new Date(device.addedAt * 1000).toLocaleDateString()}
                </Text>
              </View>
              {index === 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>This Device</Text>
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddDevice}>
            <Text style={styles.addButtonText}>+ Add Backup Device</Text>
          </TouchableOpacity>
        </View>

        {/* Multi-Sig Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Multi-Signature</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Current Threshold</Text>
            <Text style={styles.infoValue}>
              {threshold} of {devices.length}
            </Text>
          </View>
          <Text style={styles.hint}>
            {threshold === 1
              ? 'Any single device can sign transactions'
              : `Requires ${threshold} devices to sign transactions`}
          </Text>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.securityItem}>
            <Text style={styles.securityIcon}>🔐</Text>
            <View style={styles.securityText}>
              <Text style={styles.securityTitle}>Biometric Protection</Text>
              <Text style={styles.securityDescription}>
                Your private key is stored in hardware-backed secure storage
              </Text>
            </View>
          </View>
          <View style={styles.securityItem}>
            <Text style={styles.securityIcon}>🔒</Text>
            <View style={styles.securityText}>
              <Text style={styles.securityTitle}>On-Chain Verification</Text>
              <Text style={styles.securityDescription}>
                Signatures verified by Solana secp256r1 precompile
              </Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>
            Danger Zone
          </Text>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleDeleteWallet}>
            <Text style={styles.dangerButtonText}>Delete Wallet from Device</Text>
          </TouchableOpacity>
          <Text style={styles.dangerHint}>
            ⚠️ Make sure you have backup devices before deleting!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  deviceDate: {
    fontSize: 12,
    color: '#666',
  },
  badge: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#6200EE',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#6200EE',
    fontSize: 16,
    fontWeight: '600',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  securityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  securityText: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  dangerTitle: {
    color: '#D32F2F',
  },
  dangerButton: {
    backgroundColor: '#D32F2F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerHint: {
    fontSize: 12,
    color: '#D32F2F',
    textAlign: 'center',
  },
});

