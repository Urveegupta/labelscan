import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Colors from '../constants/colors';

const isWeb = Platform.OS === 'web';

const LEVEL_COLORS = {
  low: Colors.nutritionLow,
  moderate: Colors.nutritionModerate,
  high: Colors.nutritionHigh,
};

const LEVEL_BG = {
  low: '#ECFDF5',
  moderate: '#FFF7ED',
  high: '#FEF2F2',
};

// For inverted nutrients (protein, fiber): high = good (green), low = orange
const INVERTED_LEVEL_COLORS = {
  high: Colors.nutritionLow,     // green
  moderate: Colors.nutritionModerate,
  low: Colors.nutritionHigh,     // red/orange
};

const INVERTED_LEVEL_BG = {
  high: '#ECFDF5',
  moderate: '#FFF7ED',
  low: '#FEF2F2',
};

/**
 * Pick the best display value: prefer per-serving (matches package label),
 * fall back to per-100g.
 */
function pickDisplay(data, unitServing, unit100g) {
  if (data?.valueServing != null) {
    return { display: `${data.valueServing}${unitServing}`, unitLabel: 'per serving' };
  }
  if (data?.value != null) {
    return { display: `${data.value}${unit100g}`, unitLabel: 'per 100g' };
  }
  return { display: 'N/A', unitLabel: null };
}

/**
 * Expanded nutrition breakdown with clickable rows that reveal contributing ingredients.
 * Shows per-serving values when available (matches the package), falls back to per-100g.
 */
export default function NutritionBreakdown({ breakdown, ingredientTags }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!breakdown) return null;

  const cal = pickDisplay(breakdown.calories, '', ' kcal');
  const items = [
    {
      key: 'calories',
      label: 'Calories',
      icon: '\uD83D\uDD25',
      ...breakdown.calories,
      display: cal.display === 'N/A' ? 'N/A' : cal.display,
      unitLabel: cal.unitLabel ? `kcal ${cal.unitLabel}` : null,
    },
    {
      key: 'protein',
      label: 'Protein',
      icon: '\uD83D\uDCAA',
      ...breakdown.protein,
      ...pickDisplay(breakdown.protein, 'g', 'g'),
    },
    {
      key: 'carbs',
      label: 'Carbs',
      icon: '\uD83C\uDF5E',
      ...breakdown.carbs,
      ...pickDisplay(breakdown.carbs, 'g', 'g'),
    },
    {
      key: 'fat',
      label: 'Total Fat',
      icon: '\uD83E\uDED2',
      ...breakdown.fat,
      ...pickDisplay(breakdown.fat, 'g', 'g'),
    },
    {
      key: 'fiber',
      label: 'Fiber',
      icon: '\uD83C\uDF3E',
      ...breakdown.fiber,
      ...pickDisplay(breakdown.fiber, 'g', 'g'),
    },
    {
      key: 'sugar',
      label: 'Sugar',
      icon: '\uD83C\uDF6C',
      ...breakdown.sugar,
      ...pickDisplay(breakdown.sugar, 'g', 'g'),
    },
    {
      key: 'salt',
      label: 'Salt',
      icon: '\uD83E\uDDC2',
      ...breakdown.salt,
      ...pickDisplay(breakdown.salt, 'g', 'g'),
    },
    {
      key: 'saturatedFat',
      label: 'Saturated Fat',
      icon: '\uD83E\uDDC8',
      ...breakdown.saturatedFat,
      ...pickDisplay(breakdown.saturatedFat, 'g', 'g'),
    },
    {
      key: 'additives',
      label: 'Additives',
      icon: '\u2697\uFE0F',
      ...breakdown.additives,
      display: `${breakdown.additives?.value || 0}`,
      unitLabel: null,
    },
  ];

  const servingSize = breakdown.servingSize;

  return (
    <View style={styles.container}>
      {servingSize && (
        <Text style={styles.servingNote}>Serving size: {servingSize}</Text>
      )}
      {items.map((item, index) => {
        const isExpanded = expandedIndex === index;
        const isInverted = item.inverted;
        const levelColors = isInverted ? INVERTED_LEVEL_COLORS : LEVEL_COLORS;
        const levelBg = isInverted ? INVERTED_LEVEL_BG : LEVEL_BG;
        const level = item.level || 'low';
        const tags = ingredientTags?.[item.key] || [];

        return (
          <View key={item.key}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setExpandedIndex(isExpanded ? null : index)}
              style={[
                styles.item,
                { backgroundColor: item.level ? (levelBg[level] || LEVEL_BG.low) : '#F8FAFC' },
              ]}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <View style={styles.itemContent}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.value}>{item.display}</Text>
                {item.unitLabel && <Text style={styles.unit}>{item.unitLabel}</Text>}
              </View>
              {item.level ? (
                <View
                  style={[
                    styles.levelBadge,
                    { backgroundColor: levelColors[level] || LEVEL_COLORS.low },
                  ]}
                >
                  <Text style={styles.levelText}>{level.toUpperCase()}</Text>
                </View>
              ) : (
                <View style={[styles.levelBadge, { backgroundColor: '#94A3B8' }]}>
                  <Text style={styles.levelText}>N/A</Text>
                </View>
              )}
              <Text style={styles.chevron}>{isExpanded ? '\u25BE' : '\u25B8'}</Text>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.expandedContainer}>
                {tags.length > 0 ? (
                  <View style={styles.chipRow}>
                    {tags.map((ingredient, i) => (
                      <View key={i} style={styles.chip}>
                        <Text style={styles.chipText}>{ingredient}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noIngredients}>No specific ingredients identified</Text>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  servingNote: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    ...(isWeb ? { cursor: 'pointer' } : {}),
  },
  icon: {
    fontSize: 22,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 1,
  },
  unit: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 0,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chevron: {
    fontSize: 16,
    color: Colors.textMuted,
    marginLeft: 8,
  },
  expandedContainer: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: '#E8EDF2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  noIngredients: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
