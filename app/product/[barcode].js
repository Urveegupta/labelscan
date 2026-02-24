import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../src/constants/colors';
import strings from '../../src/constants/strings';
import { lookupProduct } from '../../src/api/productService';
import { getIngredientNutrientTags } from '../../src/engine/scoringEngine';
import ScoreBadge from '../../src/components/ScoreBadge';
import IngredientList from '../../src/components/IngredientList';
import NutritionBreakdown from '../../src/components/NutritionBreakdown';

const isWeb = Platform.OS === 'web';
const F = isWeb
  ? { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
  : {};

export default function ProductDetailScreen() {
  const { barcode } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [score, setScore] = useState(null);
  const [source, setSource] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await lookupProduct(barcode);
        setProduct(result.product);
        setScore(result.score);
        setSource(result.source);
      } catch (err) {
        console.warn('Product lookup crashed:', err);
        setProduct(null);
        setScore(null);
        setSource(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [barcode]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.loadingText, F]}>{strings.loading}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <Ionicons name="alert-circle-outline" size={64} color={Colors.textMuted} />
        <Text style={[styles.notFoundTitle, F]}>{strings.productNotFound}</Text>
        <Text style={[styles.notFoundMessage, F]}>{strings.productNotFoundMessage}</Text>
        <Text style={[styles.barcodeText, F]}>Barcode: {barcode}</Text>

        <View style={styles.notFoundActions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push({ pathname: '/add-product', params: { barcode } })}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={[styles.primaryButtonText, F]}>{strings.addProduct}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/scanner')}
          >
            <Ionicons name="barcode-outline" size={20} color={Colors.primary} />
            <Text style={[styles.secondaryButtonText, F]}>{strings.scanAgain}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={isWeb ? styles.webScroll : undefined} showsVerticalScrollIndicator={false}>
      <Stack.Screen
        options={{
          title: product.name,
          headerTitleStyle: { fontSize: 16, fontWeight: '600', ...F },
        }}
      />

      <View style={isWeb ? styles.webContent : undefined}>
        {/* Hero Section */}
        <View style={styles.hero}>
          {product.image_url && (
            <Image
              source={{ uri: product.image_url }}
              style={styles.productImage}
              resizeMode="contain"
            />
          )}
          <View style={styles.heroContent}>
            <ScoreBadge grade={score.grade} score={score.score} size="large" />
            <Text style={[styles.productName, F]}>{product.name}</Text>
            <Text style={[styles.productBrand, F]}>{product.brand}</Text>
            {source && (
              <View style={styles.sourceTag}>
                <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
                <Text style={[styles.sourceText, F]}>{strings.source[source] || source}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Score Breakdown */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, F]}>Score Breakdown</Text>
          <Text style={[styles.cardHint, { marginTop: 0, marginBottom: 14 }, F]}>Score starts at 100 — here's what brought it down</Text>
          <View style={styles.scoreBar}>
            <ScoreBarItem
              label="Harmful Additives"
              penalty={score.penalties.additive}
              max={40}
              desc={score.penalties.additive === 0 ? 'None detected' : `${score.stats.harmfulAdditives} harmful, ${score.stats.concerningAdditives} concerning found`}
            />
            <ScoreBarItem
              label="Sugar, Salt & Fat"
              penalty={score.penalties.nutrition}
              max={30}
              desc={score.penalties.nutrition === 0 ? 'Within healthy range' : score.penalties.nutrition <= 10 ? 'Slightly elevated levels' : score.penalties.nutrition <= 20 ? 'Moderately high levels' : 'Very high levels'}
            />
            <ScoreBarItem
              label="Processing Level"
              penalty={score.penalties.processing}
              max={15}
              desc={score.penalties.processing === 0 ? 'Minimal processing' : score.penalties.processing <= 5 ? 'Some additives detected' : 'Heavily processed'}
            />
          </View>
          <View style={styles.statsRow}>
            <StatBadge value={score.stats.totalIngredients} label="Ingredients" color={Colors.textSecondary} />
            <StatBadge value={score.stats.harmfulAdditives} label="Harmful" color={score.stats.harmfulAdditives > 0 ? Colors.harmful : Colors.good} />
            <StatBadge value={score.stats.concerningAdditives} label="Concerning" color={score.stats.concerningAdditives > 0 ? Colors.concerning : Colors.good} />
          </View>
        </View>

        {/* Nutrition */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, F]}>{strings.nutritionBreakdown}</Text>
          <Text style={[styles.cardHint, { marginTop: 0, marginBottom: 14 }, F]}>
            {isWeb ? 'Click' : 'Tap'} any row to see contributing ingredients
          </Text>
          <NutritionBreakdown
            breakdown={score.nutritionBreakdown}
            ingredientTags={getIngredientNutrientTags(product.ingredients_text)}
          />
        </View>

        {/* Ingredients */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, F]}>
            {strings.ingredients} ({score.ingredients.length})
          </Text>
          <Text style={[styles.cardHint, F]}>
            {isWeb ? 'Click' : 'Tap'} flagged ingredients for details
          </Text>
          <IngredientList ingredients={score.ingredients} />
        </View>

        {/* Raw ingredients text */}
        {product.ingredients_text && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, F]}>Label Text</Text>
            <Text style={[styles.rawText, F]}>{product.ingredients_text}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/scanner')}
          >
            <Ionicons name="barcode-outline" size={20} color={Colors.primary} />
            <Text style={[styles.actionButtonText, F]}>{strings.scanAgain}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </View>
    </ScrollView>
  );
}

function ScoreBarItem({ label, penalty, max, desc }) {
  const pct = max > 0 ? (penalty / max) * 100 : 0;
  const barColor = pct > 66 ? Colors.harmful : pct > 33 ? Colors.concerning : Colors.good;

  return (
    <View style={styles.scoreBarItem}>
      <View style={styles.scoreBarLabelRow}>
        <Text style={[styles.scoreBarLabel, F]}>{label}</Text>
        <Text style={[styles.scoreBarValue, { color: barColor }, F]}>
          {penalty === 0 ? 'No impact' : `−${penalty} pts`}
        </Text>
      </View>
      <View style={styles.scoreBarTrack}>
        <View style={[styles.scoreBarFill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
      {desc ? <Text style={[styles.scoreBarDesc, F]}>{desc}</Text> : null}
    </View>
  );
}

function StatBadge({ value, label, color }) {
  return (
    <View style={styles.statBadge}>
      <Text style={[styles.statValue, { color }, F]}>{value}</Text>
      <Text style={[styles.statLabel, F]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isWeb ? '#FAFAFA' : Colors.background,
  },
  webScroll: {
    alignItems: 'center',
  },
  webContent: {
    width: '100%',
    maxWidth: 640,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isWeb ? '#FAFAFA' : Colors.background,
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    color: Colors.textSecondary,
    fontSize: 15,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 20,
  },
  notFoundMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  barcodeText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: isWeb ? 'SFMono-Regular, Menlo, Consolas, monospace' : 'monospace',
    marginTop: 12,
    backgroundColor: Colors.divider,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  notFoundActions: {
    marginTop: 28,
    gap: 12,
    width: '100%',
    maxWidth: 320,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    ...(isWeb ? { cursor: 'pointer' } : {}),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
    ...(isWeb ? { cursor: 'pointer' } : {}),
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  // Hero
  hero: {
    backgroundColor: '#FFFFFF',
    paddingTop: isWeb ? 32 : 8,
    paddingBottom: 28,
    alignItems: 'center',
    ...(isWeb ? {
      borderRadius: 16,
      marginTop: 24,
      marginHorizontal: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    } : {
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    }),
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 16,
  },
  productBrand: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    backgroundColor: isWeb ? '#F3F4F6' : Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sourceText: {
    fontSize: 12,
    color: Colors.textMuted,
  },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: isWeb ? 12 : 16,
    padding: 20,
    ...(isWeb ? {
      borderWidth: 1,
      borderColor: '#E5E7EB',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    }),
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  cardHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: -8,
    marginBottom: 10,
  },

  // Score breakdown
  scoreBarItem: { marginBottom: 14 },
  scoreBarLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  scoreBarLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  scoreBarValue: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  scoreBarTrack: {
    height: 6,
    backgroundColor: isWeb ? '#F3F4F6' : Colors.divider,
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreBarDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: isWeb ? '#E5E7EB' : Colors.divider,
  },
  statBadge: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Raw text
  rawText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Actions
  actions: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: isWeb ? '#E5E7EB' : Colors.border,
    ...(isWeb ? { cursor: 'pointer' } : {}),
  },
  actionButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },

  bottomPadding: { height: 40 },
});
