import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

const F = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' };

export default function ScannerWebScreen() {
  const router = useRouter();
  const [barcode, setBarcode] = useState('');

  function handleLookup() {
    const trimmed = barcode.trim();
    if (!trimmed) return;
    router.replace(`/product/${trimmed}`);
  }

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ title: 'Look Up Product' }} />

      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="barcode-outline" size={32} color={Colors.primary} />
          </View>

          <Text style={styles.title}>Enter a barcode number</Text>
          <Text style={styles.subtitle}>
            Type or paste the barcode from any Indian food product label.
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={barcode}
              onChangeText={setBarcode}
              placeholder="e.g. 8901058811001"
              placeholderTextColor="#B0B0B0"
              autoFocus
              onSubmitEditing={handleLookup}
            />
            <TouchableOpacity
              style={[styles.submitBtn, !barcode.trim() && styles.submitBtnDisabled]}
              onPress={handleLookup}
              disabled={!barcode.trim()}
            >
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.altLink}
            onPress={() => router.push('/add-product')}
          >
            <Ionicons name="add-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.altLinkText}>Or add a new product manually</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    paddingHorizontal: 36,
    width: '100%',
    maxWidth: 460,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
    ...F,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
    ...F,
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: Colors.text,
    letterSpacing: 0.5,
    outlineStyle: 'none',
    ...F,
  },
  submitBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
  },
  altLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
  },
  altLinkText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    ...F,
  },
});
