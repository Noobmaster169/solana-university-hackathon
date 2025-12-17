import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PublicKey } from '@solana/web3.js';
import { RootStackParamList } from '../navigation/AppNavigator';
import { KeystoreSDK } from '../sdk';

type SendScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Send'>;

interface Props {
  navigation: SendScreenNavigationProp;
}

export default function SendScreen({ navigation }: Props) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  const sdk = new KeystoreSDK({
    rpcUrl: 'https://api.devnet.solana.com',
  });

  const handleSend = async () => {
    // Validation
    if (!recipient.trim()) {
      Alert.alert('Error', 'Please enter a recipient address');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // Validate address
    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(recipient.trim());
    } catch (error) {
      Alert.alert('Error', 'Invalid recipient address');
      return;
    }

    // Confirm transaction
    Alert.alert(
      'Confirm Transaction',
      `Send ${amountNum} SOL to\n${recipientPubkey.toBase58().slice(0, 8)}...${recipientPubkey.toBase58().slice(-8)}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => executeSend(recipientPubkey, amountNum),
        },
      ]
    );
  };

  const executeSend = async (to: PublicKey, amountSol: number) => {
    setSending(true);
    try {
      const signature = await sdk.sendTransaction({
        to,
        amount: amountSol,
      });

      Alert.alert(
        'Success!',
        `Transaction sent successfully!\n\nSignature: ${signature.slice(0, 8)}...`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error sending transaction:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to send transaction. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  const handleMaxAmount = async () => {
    try {
      const wallet = await sdk.getWallet();
      if (wallet) {
        // Leave some for fees
        const maxAmount = Math.max(0, wallet.balance - 0.001);
        setAmount(maxAmount.toFixed(4));
      }
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Send SOL</Text>
        <Text style={styles.description}>
          Enter the recipient's address and amount to send
        </Text>

        {/* Recipient Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Recipient Address</Text>
          <TextInput
            style={styles.input}
            value={recipient}
            onChangeText={setRecipient}
            placeholder="Enter Solana address"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!sending}
          />
        </View>

        {/* Amount Input */}
        <View style={styles.inputContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Amount (SOL)</Text>
            <TouchableOpacity onPress={handleMaxAmount} disabled={sending}>
              <Text style={styles.maxButton}>MAX</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
            editable={!sending}
          />
          {amount && !isNaN(parseFloat(amount)) && (
            <Text style={styles.hint}>
              ≈ ${(parseFloat(amount) * 100).toFixed(2)} USD
            </Text>
          )}
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[styles.button, sending && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={sending}>
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send with Biometrics</Text>
          )}
        </TouchableOpacity>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🔐 Biometric Confirmation</Text>
          <Text style={styles.infoText}>
            You'll be prompted to authenticate with your fingerprint or face to
            sign this transaction.
            {'\n\n'}
            Your private key never leaves this device and is only accessible
            with your biometrics.
          </Text>
        </View>

        {/* Network Fee Info */}
        <View style={styles.feeInfo}>
          <Text style={styles.feeText}>
            Network fees are covered by the relayer
          </Text>
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
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  maxButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200EE',
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
    marginBottom: 16,
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
  feeInfo: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  feeText: {
    fontSize: 12,
    color: '#999',
  },
});

