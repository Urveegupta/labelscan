import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { initDatabase, seedDatabase } from '../src/database/database';
import Colors from '../src/constants/colors';

const isWeb = Platform.OS === 'web';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        await seedDatabase();
        setReady(true);
      } catch (err) {
        console.error('Database init error:', err);
        setError(err.message);
        setReady(true);
      }
    }
    init();
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading LabelScan...</Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: isWeb
            ? { backgroundColor: '#FFFFFF', height: 56 }
            : { backgroundColor: Colors.surface },
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: '600',
            color: Colors.text,
            ...(isWeb ? { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' } : {}),
          },
          headerShadowVisible: isWeb,
          contentStyle: { backgroundColor: isWeb ? '#FAFAFA' : Colors.background },
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
