import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../src/constants/colors';
import strings from '../src/constants/strings';
import { searchProducts, getDatabaseStats } from '../src/database/database';
import { scoreProduct } from '../src/engine/scoringEngine';
import ScoreBadge from '../src/components/ScoreBadge';

const isWeb = Platform.OS === 'web';
const WEB_FONT = isWeb
  ? { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
  : {};

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
          <Text style={[styles.productName, WEB_FONT]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.productBrand, WEB_FONT]} numberOfLines={1}>{item.brand}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
      </TouchableOpacity>
    );
  }

  if (!isWeb) {
    // ── Native: keep original mobile layout ──
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.nativeHeader}>
          <View>
            <Text style={styles.nativeAppName}>{strings.appName}</Text>
            <Text style={styles.nativeTagline}>{strings.tagline}</Text>
          </View>
          {stats && (
            <View style={styles.nativeStatsBox}>
              <Text style={styles.nativeStatsNum}>{stats.totalProducts}</Text>
              <Text style={styles.nativeStatsLabel}>products</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.nativeScanBtn}
          onPress={() => router.push('/scanner')}
          activeOpacity={0.8}
        >
          <View style={styles.nativeScanInner}>
            <Ionicons name="barcode-outline" size={32} color="#FFFFFF" />
            <Text style={styles.nativeScanText}>{strings.scanProduct}</Text>
            <Text style={styles.nativeScanHint}>Tap to scan a barcode</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.nativeSearchWrap}>
          <Ionicons name="search" size={20} color={Colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.nativeSearchInput}
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
        {searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.barcode}
            style={{ flex: 1, marginTop: 8 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        ) : searchQuery.length >= 2 ? (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Ionicons name="search-outline" size={40} color={Colors.textMuted} />
            <Text style={{ color: Colors.textMuted, marginTop: 12 }}>No products found</Text>
          </View>
        ) : (
          <View style={{ marginHorizontal: 20, marginTop: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 }}>How it works</Text>
            {[
              { icon: 'barcode-outline', bg: '#E8F5E9', color: Colors.primary, title: 'Scan a barcode', desc: 'Point your camera at any food product barcode' },
              { icon: 'analytics-outline', bg: '#FFF3E0', color: Colors.accent, title: 'Get instant analysis', desc: 'See health score, ingredients breakdown, and nutrition info' },
              { icon: 'people-outline', bg: '#E3F2FD', color: '#1976D2', title: 'Help build the database', desc: 'Add products not yet in our system' },
            ].map((t) => (
              <View key={t.title} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: t.bg, justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
                  <Ionicons name={t.icon} size={20} color={t.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text }}>{t.title}</Text>
                  <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>{t.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  // ── Web: professional website layout ──
  return (
    <ScrollView style={styles.webPage} contentContainerStyle={styles.webPageContent}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Nav bar */}
      <View style={styles.webNav}>
        <View style={styles.webNavInner}>
          <View style={styles.webNavBrand}>
            <View style={styles.webNavLogo}>
              <Ionicons name="leaf" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.webNavTitle}>LabelScan</Text>
          </View>
          <View style={styles.webNavLinks}>
            {stats && (
              <TouchableOpacity
                style={styles.webNavStatBtn}
                onPress={() => router.push('/browse')}
              >
                <Ionicons name="cube-outline" size={14} color={Colors.primary} />
                <Text style={styles.webNavStat}>
                  {stats.totalProducts} products
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.webNavTextLink}
              onPress={() => router.push('/methodology')}
            >
              <Text style={styles.webNavTextLinkText}>How we rate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.webNavLink}
              onPress={() => router.push('/add-product')}
            >
              <Ionicons name="add-circle-outline" size={16} color={Colors.primary} />
              <Text style={styles.webNavLinkText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Hero */}
      <View style={styles.webHero}>
        <View style={styles.webHeroInner}>
          <Text style={styles.webHeroTitle}>Know what you eat.</Text>
          <Text style={styles.webHeroSub}>
            Scan any Indian food product to see its health score, additives, and nutrition breakdown — instantly.
          </Text>

          {/* Search bar — hero-style */}
          <View style={styles.webHeroSearch}>
            <Ionicons name="search" size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.webHeroInput}
              placeholder="Search products by name or brand..."
              placeholderTextColor="#AAAAAA"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCorrect={false}
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => handleSearch('')} style={styles.webSearchClear}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.webHeroBtn}
              onPress={() => router.push('/scanner')}
            >
              <Ionicons name="barcode-outline" size={18} color="#FFF" />
              <Text style={styles.webHeroBtnText}>Look up barcode</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search results */}
      {searchResults.length > 0 ? (
        <View style={styles.webSection}>
          <Text style={styles.webSectionTitle}>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
          </Text>
          <View style={styles.webResultsGrid}>
            {searchResults.map((item) => {
              const score = scoreProduct(item);
              return (
                <TouchableOpacity
                  key={item.barcode}
                  style={styles.webResultCard}
                  onPress={() => router.push(`/product/${item.barcode}`)}
                  activeOpacity={0.8}
                >
                  <ScoreBadge grade={score.grade} size="small" />
                  <View style={styles.webResultInfo}>
                    <Text style={styles.webResultName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.webResultBrand} numberOfLines={1}>{item.brand}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : searchQuery.length >= 2 ? (
        <View style={styles.webSection}>
          <View style={styles.webEmpty}>
            <Ionicons name="search-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.webEmptyText}>No products found for "{searchQuery}"</Text>
            <TouchableOpacity
              style={styles.webEmptyBtn}
              onPress={() => router.push('/add-product')}
            >
              <Text style={styles.webEmptyBtnText}>Add this product</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Feature cards */
        <View style={styles.webSection}>
          <Text style={styles.webSectionTitle}>How it works</Text>
          <View style={styles.webFeatures}>
            {[
              {
                icon: 'barcode-outline',
                color: Colors.primary,
                bg: '#E8F5E9',
                title: 'Look up any product',
                desc: 'Enter a barcode or search by name to instantly find product details from our database.',
              },
              {
                icon: 'shield-checkmark-outline',
                color: Colors.accent,
                bg: '#FFF3E0',
                title: 'Health score A-E',
                desc: 'Every product gets a clear health grade based on ingredients, additives, and nutrition data.',
              },
              {
                icon: 'people-outline',
                color: '#1976D2',
                bg: '#E3F2FD',
                title: 'Community-driven',
                desc: 'Help build India\'s largest open food database by adding products you find.',
              },
            ].map((f) => (
              <View key={f.title} style={styles.webFeatureCard}>
                <View style={[styles.webFeatureIcon, { backgroundColor: f.bg }]}>
                  <Ionicons name={f.icon} size={24} color={f.color} />
                </View>
                <Text style={styles.webFeatureTitle}>{f.title}</Text>
                <Text style={styles.webFeatureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.webFooter}>
        <Text style={styles.webFooterText}>
          LabelScan — Open-source food transparency for India
        </Text>
      </View>
    </ScrollView>
  );
}

// ── Native styles (unchanged mobile) ──
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  nativeHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 12,
    backgroundColor: Colors.surface,
  },
  nativeAppName: { fontSize: 28, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  nativeTagline: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  nativeStatsBox: { alignItems: 'center', backgroundColor: Colors.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  nativeStatsNum: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  nativeStatsLabel: { fontSize: 11, color: Colors.textMuted },
  nativeScanBtn: {
    marginHorizontal: 20, marginTop: 16, borderRadius: 16, backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  nativeScanInner: { padding: 24, alignItems: 'center' },
  nativeScanText: { color: '#FFF', fontSize: 20, fontWeight: '700', marginTop: 8 },
  nativeScanHint: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  nativeSearchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    marginHorizontal: 20, marginTop: 16, borderRadius: 12, paddingHorizontal: 14, height: 48,
    borderWidth: 1, borderColor: Colors.border,
  },
  nativeSearchInput: { flex: 1, fontSize: 15, color: Colors.text },

  // ── Shared product item (native FlatList) ──
  productItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    padding: 14, borderRadius: 12, marginTop: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  productInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
  productName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  productBrand: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  // ── Web styles ──
  webPage: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  webPageContent: {
    minHeight: '100%',
  },

  // Nav
  webNav: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  webNavInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%',
  },
  webNavBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  webNavLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webNavTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    ...WEB_FONT,
  },
  webNavLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  webNavStatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    cursor: 'pointer',
  },
  webNavStat: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
    ...WEB_FONT,
  },
  webNavTextLink: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    cursor: 'pointer',
  },
  webNavTextLinkText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    ...WEB_FONT,
  },
  webNavLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    cursor: 'pointer',
  },
  webNavLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    ...WEB_FONT,
  },

  // Hero
  webHero: {
    backgroundColor: '#FFFFFF',
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  webHeroInner: {
    maxWidth: 640,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  webHeroTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -1,
    ...WEB_FONT,
  },
  webHeroSub: {
    fontSize: 17,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 26,
    maxWidth: 520,
    ...WEB_FONT,
  },
  webHeroSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 5,
    height: 52,
    width: '100%',
    maxWidth: 580,
    marginTop: 32,
  },
  webHeroInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    marginLeft: 10,
    outlineStyle: 'none',
    ...WEB_FONT,
  },
  webSearchClear: {
    padding: 6,
  },
  webHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
    cursor: 'pointer',
  },
  webHeroBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    ...WEB_FONT,
  },

  // Section
  webSection: {
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  webSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 20,
    ...WEB_FONT,
  },

  // Results grid
  webResultsGrid: {
    gap: 10,
  },
  webResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    cursor: 'pointer',
  },
  webResultInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  webResultName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    ...WEB_FONT,
  },
  webResultBrand: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    ...WEB_FONT,
  },

  // Empty
  webEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  webEmptyText: {
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: 12,
    ...WEB_FONT,
  },
  webEmptyBtn: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    cursor: 'pointer',
  },
  webEmptyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    ...WEB_FONT,
  },

  // Features
  webFeatures: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  webFeatureCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  webFeatureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  webFeatureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    ...WEB_FONT,
  },
  webFeatureDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    ...WEB_FONT,
  },

  // Footer
  webFooter: {
    paddingVertical: 32,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 'auto',
  },
  webFooterText: {
    fontSize: 13,
    color: Colors.textMuted,
    ...WEB_FONT,
  },
});
