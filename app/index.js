import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../src/constants/colors';
import strings from '../src/constants/strings';
import { searchProducts, getDatabaseStats } from '../src/database/database';
import { scoreProduct } from '../src/engine/scoringEngine';
import ScoreBadge from '../src/components/ScoreBadge';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [stats, setStats] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  async function loadStats() {
    try {
      const s = await getDatabaseStats();
      setStats(s);
    } catch {}
  }

  async function handleSearch(query) {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchProducts(query);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  }

  function renderProductItem({ item }) {
    const score = scoreProduct(item);
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => router.push(`/product/${item.barcode}`)}
        activeOpacity={0.7}
      >
        <ScoreBadge grade={score.grade} size="small" />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productBrand} numberOfLines={1}>{item.brand}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>{strings.appName}</Text>
          <Text style={styles.tagline}>{strings.tagline}</Text>
        </View>
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsNumber}>{stats.totalProducts}</Text>
            <Text style={styles.statsLabel}>products</Text>
          </View>
        )}
      </View>

      {/* Scan Button */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => router.push('/scanner')}
        activeOpacity={0.8}
      >
        <View style={styles.scanButtonInner}>
          <Ionicons name="barcode-outline" size={32} color="#FFFFFF" />
          <Text style={styles.scanButtonText}>{strings.scanProduct}</Text>
          <Text style={styles.scanButtonHint}>Tap to scan a barcode</Text>
        </View>
      </TouchableOpacity>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={strings.searchProducts}
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      {searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.barcode}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : searchQuery.length >= 2 ? (
        <View style={styles.emptySearch}>
          <Ionicons name="search-outline" size={40} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No products found for "{searchQuery}"</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-product')}
          >
            <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.addButtonText}>{strings.addManually}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.quickTips}>
          <Text style={styles.tipsTitle}>How it works</Text>
          <View style={styles.tipItem}>
            <View style={[styles.tipIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="barcode-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Scan a barcode</Text>
              <Text style={styles.tipDesc}>Point your camera at any food product barcode</Text>
            </View>
          </View>
          <View style={styles.tipItem}>
            <View style={[styles.tipIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="analytics-outline" size={20} color={Colors.accent} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Get instant analysis</Text>
              <Text style={styles.tipDesc}>See health score, ingredients breakdown, and nutrition info</Text>
            </View>
          </View>
          <View style={styles.tipItem}>
            <View style={[styles.tipIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="people-outline" size={20} color="#1976D2" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Help build the database</Text>
              <Text style={styles.tipDesc}>Add products not yet in our system</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsContainer: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statsNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  statsLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  scanButton: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanButtonInner: {
    padding: 24,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  scanButtonHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  list: {
    flex: 1,
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  productBrand: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptySearch: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  quickTips: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  tipDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
