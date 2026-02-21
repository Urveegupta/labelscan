import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

/**
 * Scannable ingredient list with color-coded risk indicators.
 * Tapping a flagged ingredient reveals explanation.
 */
export default function IngredientList({ ingredients }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!ingredients || ingredients.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No ingredient data available</Text>
      </View>
    );
  }

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      {ingredients.map((ingredient, index) => {
        const isExpanded = expandedIndex === index;
        const hasDetail = ingredient.additive && ingredient.additive.description;
        const riskIcon = getRiskIcon(ingredient.risk);

        return (
          <TouchableOpacity
            key={index}
            style={[styles.item, index < ingredients.length - 1 && styles.itemBorder]}
            onPress={() => hasDetail && toggleExpand(index)}
            activeOpacity={hasDetail ? 0.6 : 1}
          >
            <View style={styles.itemRow}>
              <View style={[styles.dot, { backgroundColor: ingredient.color }]} />
              <View style={styles.itemContent}>
                <Text style={styles.ingredientName} numberOfLines={isExpanded ? undefined : 1}>
                  {ingredient.name}
                </Text>
                {ingredient.additive?.ins && (
                  <Text style={styles.insNumber}>INS {ingredient.additive.ins}</Text>
                )}
              </View>
              <View style={styles.labelContainer}>
                <Text style={[styles.riskLabel, { color: ingredient.color }]}>
                  {riskIcon} {ingredient.label}
                </Text>
                {hasDetail && (
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={Colors.textMuted}
                    style={styles.chevron}
                  />
                )}
              </View>
            </View>

            {isExpanded && hasDetail && (
              <View style={[styles.explanation, { borderLeftColor: ingredient.color }]}>
                {ingredient.additive.officialName && ingredient.additive.officialName !== ingredient.name && (
                  <Text style={styles.officialName}>{ingredient.additive.officialName}</Text>
                )}
                <Text style={styles.explanationText}>{ingredient.additive.description}</Text>
                {ingredient.additive.category && (
                  <Text style={styles.category}>
                    Category: {ingredient.additive.category.replace(/_/g, ' ')}
                  </Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function getRiskIcon(risk) {
  switch (risk) {
    case 0: return '';
    case 1: return '';
    case 2: return '';
    case 3: return '';
    default: return '';
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  insNumber: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  riskLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 4,
  },
  explanation: {
    marginTop: 8,
    marginLeft: 22,
    paddingLeft: 12,
    borderLeftWidth: 3,
  },
  officialName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  explanationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  category: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    textTransform: 'capitalize',
  },
});
