import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../src/constants/colors';
import { GRADES } from '../src/engine/scoringEngine';

const isWeb = Platform.OS === 'web';
const F = isWeb
  ? { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
  : {};

function Section({ icon, iconColor, iconBg, title, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <Text style={[styles.sectionTitle, F]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Penalty({ label, max, description }) {
  return (
    <View style={styles.penaltyRow}>
      <View style={styles.penaltyHeader}>
        <Text style={[styles.penaltyLabel, F]}>{label}</Text>
        <View style={styles.penaltyBadge}>
          <Text style={[styles.penaltyMax, F]}>up to {max} pts</Text>
        </View>
      </View>
      <Text style={[styles.penaltyDesc, F]}>{description}</Text>
    </View>
  );
}

function ThresholdTable({ rows, unit }) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeaderCell, styles.tableHeaderLeft, F]}>{unit}</Text>
        <Text style={[styles.tableHeaderCell, F]}>Level</Text>
      </View>
      {rows.map((row, i) => (
        <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
          <Text style={[styles.tableCell, styles.tableCellLeft, F]}>{row.range}</Text>
          <View style={[styles.levelDot, { backgroundColor: row.color }]} />
          <Text style={[styles.tableCell, F]}>{row.level}</Text>
        </View>
      ))}
    </View>
  );
}

export default function MethodologyScreen() {
  const grades = Object.values(GRADES);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: 'How We Rate Products' }} />

      <View style={styles.inner}>
        {/* Intro */}
        <View style={styles.intro}>
          <Text style={[styles.heroTitle, F]}>How We Rate Products</Text>
          <Text style={[styles.heroSub, F]}>
            Every product starts with a perfect score of 100. We then subtract penalty points across four categories based on what's actually in the food. The final score maps to a simple A–E grade.
          </Text>
        </View>

        {/* Grade scale */}
        <View style={styles.gradeScale}>
          {grades.map((g) => (
            <View key={g.letter} style={styles.gradeItem}>
              <View style={[styles.gradeBadge, { backgroundColor: g.color }]}>
                <Text style={styles.gradeLetter}>{g.letter}</Text>
              </View>
              <Text style={[styles.gradeLabel, F]}>{g.label}</Text>
              <Text style={[styles.gradeRange, F]}>
                {g.minScore === 0 ? '0–19' : `${g.minScore}–${g.minScore + 19}`}
              </Text>
            </View>
          ))}
        </View>

        {/* Penalty categories */}
        <Text style={[styles.heading, F]}>Penalty Categories</Text>
        <Text style={[styles.headingSub, F]}>
          Points are deducted from 100 across these four areas. The maximum possible penalty is 100 points.
        </Text>

        <Section icon="flask-outline" iconColor="#E63E11" iconBg="#FBE9E7" title="Additives (up to 40 pts)">
          <Text style={[styles.bodyText, F]}>
            We check every ingredient against a database of 100+ food additives (INS numbers) and known concerning substances.
          </Text>
          <View style={styles.riskList}>
            <View style={styles.riskItem}>
              <View style={[styles.riskDot, { backgroundColor: Colors.harmful }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.riskTitle, F]}>Harmful (risk 3) — 10 pts each</Text>
                <Text style={[styles.riskDesc, F]}>Strong evidence of adverse health effects. Includes additives banned in some countries, artificial sweeteners like aspartame, flavor enhancers like MSG, and hydrogenated fats.</Text>
              </View>
            </View>
            <View style={styles.riskItem}>
              <View style={[styles.riskDot, { backgroundColor: Colors.concerning }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.riskTitle, F]}>Concerning (risk 2) — 5 pts each</Text>
                <Text style={[styles.riskDesc, F]}>Moderate evidence of risk or debated safety. Includes certain preservatives, emulsifiers, and artificial colors.</Text>
              </View>
            </View>
            <View style={styles.riskItem}>
              <View style={[styles.riskDot, { backgroundColor: Colors.neutral }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.riskTitle, F]}>Neutral (risk 1) — no penalty</Text>
                <Text style={[styles.riskDesc, F]}>Generally safe. Includes palm oil, refined flour (maida), and common processing aids.</Text>
              </View>
            </View>
            <View style={styles.riskItem}>
              <View style={[styles.riskDot, { backgroundColor: Colors.good }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.riskTitle, F]}>Good (risk 0) — no penalty</Text>
                <Text style={[styles.riskDesc, F]}>Natural, whole ingredients. Includes spices, grains, dairy, lentils, nuts, and traditional Indian ingredients like ghee, jaggery, and turmeric.</Text>
              </View>
            </View>
          </View>
        </Section>

        <Section icon="nutrition-outline" iconColor="#EE8100" iconBg="#FFF3E0" title="Nutrition (up to 30 pts)">
          <Text style={[styles.bodyText, F]}>
            We evaluate three key nutrients per 100g using thresholds adapted from the Nutri-Score methodology. Each nutrient scores 0–10 points.
          </Text>

          <Text style={[styles.subHeading, F]}>Sugar</Text>
          <ThresholdTable
            unit="g per 100g"
            rows={[
              { range: '0 – 4.5g', level: 'Low', color: Colors.good },
              { range: '4.5 – 13.5g', level: 'Moderate', color: Colors.concerning },
              { range: '13.5g +', level: 'High', color: Colors.harmful },
            ]}
          />

          <Text style={[styles.subHeading, F]}>Salt</Text>
          <ThresholdTable
            unit="g per 100g"
            rows={[
              { range: '0 – 0.6g', level: 'Low', color: Colors.good },
              { range: '0.6 – 1.2g', level: 'Moderate', color: Colors.concerning },
              { range: '1.2g +', level: 'High', color: Colors.harmful },
            ]}
          />

          <Text style={[styles.subHeading, F]}>Saturated Fat</Text>
          <ThresholdTable
            unit="g per 100g"
            rows={[
              { range: '0 – 3g', level: 'Low', color: Colors.good },
              { range: '3 – 6g', level: 'Moderate', color: Colors.concerning },
              { range: '6g +', level: 'High', color: Colors.harmful },
            ]}
          />
        </Section>

        <Section icon="cog-outline" iconColor="#1976D2" iconBg="#E3F2FD" title="Processing (up to 15 pts)">
          <Text style={[styles.bodyText, F]}>
            More numbered additives (INS codes) indicates heavier industrial processing.
          </Text>
          <View style={styles.tierList}>
            {[
              { count: '8+', pts: '15', label: 'Ultra-processed' },
              { count: '5–7', pts: '10', label: 'Heavily processed' },
              { count: '3–4', pts: '5', label: 'Moderately processed' },
              { count: '1–2', pts: '2', label: 'Lightly processed' },
            ].map((t) => (
              <View key={t.count} style={styles.tierRow}>
                <Text style={[styles.tierCount, F]}>{t.count} additives</Text>
                <Text style={[styles.tierPts, F]}>-{t.pts}</Text>
                <Text style={[styles.tierLabel, F]}>{t.label}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section icon="list-outline" iconColor="#7B1FA2" iconBg="#F3E5F5" title="Ingredient Count (up to 15 pts)">
          <Text style={[styles.bodyText, F]}>
            A high total ingredient count is a strong indicator of ultra-processing.
          </Text>
          <View style={styles.tierList}>
            {[
              { count: '20+', pts: '15', label: 'Very high' },
              { count: '16–20', pts: '10', label: 'High' },
              { count: '11–15', pts: '5', label: 'Moderate' },
              { count: '1–10', pts: '0', label: 'Normal' },
            ].map((t) => (
              <View key={t.count} style={styles.tierRow}>
                <Text style={[styles.tierCount, F]}>{t.count} ingredients</Text>
                <Text style={[styles.tierPts, F]}>-{t.pts}</Text>
                <Text style={[styles.tierLabel, F]}>{t.label}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Example */}
        <View style={styles.exampleCard}>
          <Text style={[styles.exampleTitle, F]}>Example: Maggi Masala Noodles</Text>
          <Text style={[styles.bodyText, F, { marginBottom: 12 }]}>
            Contains flavor enhancers (INS 627, 631), colour (INS 150d), and thickeners. Sugar is low (2g) but salt is very high (2.8g). 15 ingredients total.
          </Text>
          <View style={styles.exampleBreakdown}>
            {[
              { label: 'Additives', value: '-25' },
              { label: 'Nutrition', value: '-12' },
              { label: 'Processing', value: '-10' },
              { label: 'Ingredients', value: '-5' },
            ].map((e) => (
              <View key={e.label} style={styles.exampleRow}>
                <Text style={[styles.exampleLabel, F]}>{e.label}</Text>
                <Text style={[styles.exampleValue, F]}>{e.value}</Text>
              </View>
            ))}
            <View style={styles.exampleDivider} />
            <View style={styles.exampleRow}>
              <Text style={[styles.exampleTotal, F]}>Final Score</Text>
              <Text style={[styles.exampleTotalValue, F]}>48 / 100 → C</Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
          <Text style={[styles.disclaimerText, F]}>
            Scores are generated algorithmically based on label data and are not medical advice. Nutritional needs vary by individual. When in doubt, consult a healthcare professional.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isWeb ? '#FAFAFA' : Colors.background,
  },
  content: {
    ...(isWeb ? { alignItems: 'center' } : {}),
  },
  inner: {
    width: '100%',
    maxWidth: isWeb ? 720 : undefined,
    paddingHorizontal: isWeb ? 24 : 20,
    paddingTop: isWeb ? 8 : 4,
  },

  // Intro
  intro: {
    paddingVertical: 20,
  },
  heroTitle: {
    fontSize: isWeb ? 28 : 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 23,
    marginTop: 10,
  },

  // Grade scale
  gradeScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    paddingVertical: 20,
    borderWidth: isWeb ? 1 : 0,
    borderColor: '#E5E7EB',
    marginBottom: 32,
    ...(isWeb ? {} : {
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    }),
  },
  gradeItem: {
    alignItems: 'center',
    flex: 1,
  },
  gradeBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeLetter: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  gradeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 6,
  },
  gradeRange: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Headings
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  headingSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 20,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },

  // Section
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: isWeb ? 24 : 18,
    marginBottom: 16,
    borderWidth: isWeb ? 1 : 0,
    borderColor: '#E5E7EB',
    ...(isWeb ? {} : {
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },

  // Body text
  bodyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 4,
  },

  // Risk list
  riskList: {
    marginTop: 12,
    gap: 12,
  },
  riskItem: {
    flexDirection: 'row',
    gap: 10,
  },
  riskDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  riskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  riskDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginTop: 2,
  },

  // Threshold tables
  table: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isWeb ? '#E5E7EB' : Colors.border,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: isWeb ? '#F9FAFB' : Colors.divider,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableHeaderLeft: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  tableRowAlt: {
    backgroundColor: isWeb ? '#FAFAFA' : '#F9F9F9',
  },
  tableCell: {
    fontSize: 13,
    color: Colors.text,
  },
  tableCellLeft: {
    flex: 1,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  // Tier list
  tierList: {
    marginTop: 10,
    gap: 6,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: isWeb ? '#F9FAFB' : Colors.divider,
    borderRadius: 8,
  },
  tierCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    width: 120,
  },
  tierPts: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.harmful,
    width: 40,
  },
  tierLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },

  // Example
  exampleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: isWeb ? 24 : 18,
    marginTop: 16,
    borderWidth: isWeb ? 1 : 0,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    borderLeftColor: GRADES.C.color,
    ...(isWeb ? {} : {
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    }),
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  exampleBreakdown: {
    backgroundColor: isWeb ? '#F9FAFB' : Colors.divider,
    borderRadius: 8,
    padding: 12,
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  exampleLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  exampleValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.harmful,
  },
  exampleDivider: {
    height: 1,
    backgroundColor: isWeb ? '#E5E7EB' : Colors.border,
    marginVertical: 8,
  },
  exampleTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  exampleTotalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: GRADES.C.color,
  },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: isWeb ? '#F9FAFB' : Colors.divider,
    borderRadius: 10,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
});
