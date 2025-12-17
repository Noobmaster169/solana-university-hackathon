import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { KeystoreSDK } from '../sdk';

type DashboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

export default function DashboardScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [deviceName, setDeviceName] = useState('');
  const [vaultAddress, setVaultAddress] = useState('');
  const [identityAddress, setIdentityAddress] = useState('');
  const [deviceCount, setDeviceCount] = useState(1);
  const [threshold, setThreshold] = useState(1);

  const sdk = new KeystoreSDK({
    rpcUrl: 'https://api.devnet.solana.com',
  });

  useFocusEffect(
    useCallback(() => {
      loadWalletData();
    }, [])
  );

  const loadWalletData = async () => {
    try {
      const wallet = await sdk.getWallet();
      if (!wallet) {
        navigation.replace('Onboarding');
        return;
      }

      setBalance(wallet.balance);
      setDeviceName(wallet.deviceName);
      setVaultAddress(wallet.vault.toBase58());
      setIdentityAddress(wallet.identity.toBase58());

      // Get identity details
      const identity = await sdk.getIdentityAccount();
      if (identity) {
        setDeviceCount(identity.keys.length);
        setThreshold(identity.threshold);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
      Alert.alert('Error', 'Failed to load wallet data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      <View style={styles.content}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{balance.toFixed(4)} SOL</Text>
          <Text style={styles.balanceUsd}>
            ≈ ${(balance * 100).toFixed(2)} USD
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Send')}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate('Receive', { vaultAddress })
            }>
            <Text style={styles.actionIcon}>📥</Text>
            <Text style={styles.actionText}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Wallet Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Wallet Information</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Device</Text>
            <Text style={styles.infoValue}>{deviceName}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Registered Devices</Text>
            <Text style={styles.infoValue}>{deviceCount}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Multi-Sig Threshold</Text>
            <Text style={styles.infoValue}>
              {threshold} of {deviceCount}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Vault Address</Text>
            <Text style={styles.infoValueSmall} numberOfLines={1}>
              {vaultAddress}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        {deviceCount === 1 && (
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Tip</Text>
            <Text style={styles.tipText}>
              Add a backup device to enable recovery if you lose this phone.
            </Text>
            <TouchableOpacity
              style={styles.tipButton}
              onPress={() => navigation.navigate('AddDevice')}>
              <Text style={styles.tipButtonText}>Add Backup Device</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Network Info */}
        <View style={styles.networkInfo}>
          <Text style={styles.networkText}>Connected to Solana Devnet</Text>
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
  balanceCard: {
    backgroundColor: '#6200EE',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceUsd: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  infoSection: {
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
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  infoValueSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    maxWidth: '60%',
  },
  tipBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  tipButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  networkInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  networkText: {
    fontSize: 12,
    color: '#999',
  },
});

