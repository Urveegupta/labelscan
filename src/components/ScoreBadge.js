import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Large, visually dominant health score badge (A-E).
 */
export default function ScoreBadge({ grade, score, size = 'large' }) {
  if (!grade) return null;

  const isLarge = size === 'large';
  const badgeSize = isLarge ? 100 : 48;
  const fontSize = isLarge ? 44 : 22;
  const labelSize = isLarge ? 14 : 10;
  const scoreSize = isLarge ? 13 : 0;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: grade.color,
          },
        ]}
      >
        <Text style={[styles.letter, { fontSize }]}>{grade.letter}</Text>
        {isLarge && score != null && (
          <Text style={[styles.score, { fontSize: scoreSize }]}>{score}/100</Text>
        )}
      </View>
      {isLarge && (
        <Text style={[styles.label, { color: grade.color }]}>{grade.label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  letter: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  score: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginTop: -2,
  },
  label: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
