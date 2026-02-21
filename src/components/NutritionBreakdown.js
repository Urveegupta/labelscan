import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

const LEVEL_COLORS = {
  low: Colors.nutritionLow,
  moderate: Colors.nutritionModerate,
  high: Colors.nutritionHigh,
};

const LEVEL_BG = {
  low: '#E8F5E9',
  moderate: '#FFF3E0',
  high: '#FBE9E7',
};

/**
 * Nutri-score style breakdown showing sugar, salt, saturated fat, and additives.
 */
export default function NutritionBreakdown({ breakdown }) {
  if (!breakdown) return null;

  const items = [
    {
      label: 'Sugar',
      icon: '🍬',
      ...breakdown.sugar,
      display: breakdown.sugar.value != null ? `${breakdown.sugar.value}g` : 'N/A',
    },
    {
      label: 'Salt',
      icon: '🧂',
      ...breakdown.salt,
      display: breakdown.salt.value != null ? `${breakdown.salt.value}g` : 'N/A',
    },
    {
      label: 'Saturated Fat',
      icon: '🧈',
      ...breakdown.saturatedFat,
      display: breakdown.saturatedFat.value != null ? `${breakdown.saturatedFat.value}g` : 'N/A',
    },
    {
      label: 'Additives',
      icon: '⚗️',
      ...breakdown.additives,
      display: `${breakdown.additives.value || 0}`,
    },
  ];

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View
          key={item.label}
          style={[
            styles.item,
            { backgroundColor: LEVEL_BG[item.level] || LEVEL_BG.low },
            index < items.length - 1 && styles.itemMargin,
          ]}
        >
          <Text style={styles.icon}>{item.icon}</Text>
          <View style={styles.itemContent}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.display}</Text>
            {item.unit === 'g/100g' && <Text style={styles.unit}>per 100g</Text>}
          </View>
          <View
            style={[
              styles.levelBadge,
              { backgroundColor: LEVEL_COLORS[item.level] || LEVEL_COLORS.low },
            ]}
          >
            <Text style={styles.levelText}>{(item.level || 'N/A').toUpperCase()}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  itemMargin: {},
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
});
