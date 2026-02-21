import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../src/constants/colors';
import { getAllProducts, searchProducts } from '../src/database/database';
import { scoreProduct } from '../src/engine/scoringEngine';
import ScoreBadge from '../src/components/ScoreBadge';

const isWeb = Platform.OS === 'web';
const F = isWeb
  ? { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
  : {};

export default function BrowseScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const all = await getAllProducts();
      setProducts(all);
    } catch {}
    setLoading(false);
  }

  async function handleSearch(text) {
    setQuery(text);
    if (text.length < 2) {
      loadAll();
      return;
    }
    try {
      const results = await searchProducts(text);
      setProducts(results);
    } catch {}
  }

  function renderItem({ item }) {
    const score = scoreProduct(item);
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push(`/product/${item.barcode}`)}
        activeOpacity={0.7}
      >
        <ScoreBadge grade={score.grade} size="small" />
        <View style={styles.rowInfo}>
          <Text style={[styles.rowName, F]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.rowMeta, F]} numberOfLines={1}>
            {item.brand}{item.category ? `  ·  ${item.category}` : ''}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'All Products' }} />

      <View style={styles.content}>
        {/* Search bar */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={[styles.searchInput, F]}
            placeholder="Filter by name or brand..."
            placeholderTextColor="#B0B0B0"
            value={query}
            onChangeText={handleSearch}
            autoCorrect={false}
            autoFocus={isWeb}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.count, F]}>
          {products.length} product{products.length !== 1 ? 's' : ''}
          {query.length >= 2 ? ` matching "${query}"` : ''}
        </Text>

        {/* Product list */}
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.barcode}
          style={styles.list}
          contentContainerStyle={styles.listInner}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isWeb ? '#FAFAFA' : Colors.background,
  },
  content: {
    flex: 1,
    maxWidth: isWeb ? 700 : undefined,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: isWeb ? 24 : 16,
    paddingTop: isWeb ? 20 : 12,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: isWeb ? '#D1D5DB' : Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    ...(isWeb ? { outlineStyle: 'none' } : {}),
  },
  count: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 12,
    marginBottom: 4,
    marginLeft: 2,
  },
  list: {
    flex: 1,
    marginTop: 4,
  },
  listInner: {
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: isWeb ? 10 : 12,
    marginTop: 8,
    borderWidth: isWeb ? 1 : StyleSheet.hairlineWidth,
    borderColor: isWeb ? '#E5E7EB' : Colors.border,
    ...(isWeb ? { cursor: 'pointer' } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    }),
  },
  rowInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  rowMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
