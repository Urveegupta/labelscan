/**
 * LabelScan Scoring Engine
 *
 * Standalone module that scores food products based on:
 * 1. Presence of harmful additives (INS numbers)
 * 2. Nutritional content (sugar, salt, saturated fat per 100g)
 * 3. Degree of processing
 *
 * Returns a grade A-E (like Yuka/Nutri-Score) with color coding.
 */

import { lookupAdditive, RISK_LABELS, RISK_COLORS } from './additives';

// ── Grade Definitions ──

export const GRADES = {
  A: { letter: 'A', label: 'Excellent', color: '#1B8A2A', bgColor: '#E8F5E9', minScore: 80 },
  B: { letter: 'B', label: 'Good', color: '#85BB2F', bgColor: '#F1F8E9', minScore: 60 },
  C: { letter: 'C', label: 'Mediocre', color: '#FECB02', bgColor: '#FFFDE7', minScore: 40 },
  D: { letter: 'D', label: 'Poor', color: '#EE8100', bgColor: '#FFF3E0', minScore: 20 },
  E: { letter: 'E', label: 'Bad', color: '#E63E11', bgColor: '#FBE9E7', minScore: 0 },
};

// ── Nutritional Thresholds (per 100g, based on Nutri-Score methodology) ──

const SUGAR_THRESHOLDS = [
  { max: 4.5, points: 0 },
  { max: 9, points: 1 },
  { max: 13.5, points: 2 },
  { max: 18, points: 3 },
  { max: 22.5, points: 4 },
  { max: 27, points: 5 },
  { max: 31, points: 6 },
  { max: 36, points: 7 },
  { max: 40, points: 8 },
  { max: 45, points: 9 },
  { max: Infinity, points: 10 },
];

const SALT_THRESHOLDS = [
  { max: 0.2, points: 0 },
  { max: 0.4, points: 1 },
  { max: 0.6, points: 2 },
  { max: 0.8, points: 3 },
  { max: 1.0, points: 4 },
  { max: 1.2, points: 5 },
  { max: 1.4, points: 6 },
  { max: 1.6, points: 7 },
  { max: 1.8, points: 8 },
  { max: 2.0, points: 9 },
  { max: Infinity, points: 10 },
];

const SAT_FAT_THRESHOLDS = [
  { max: 1, points: 0 },
  { max: 2, points: 1 },
  { max: 3, points: 2 },
  { max: 4, points: 3 },
  { max: 5, points: 4 },
  { max: 6, points: 5 },
  { max: 7, points: 6 },
  { max: 8, points: 7 },
  { max: 9, points: 8 },
  { max: 10, points: 9 },
  { max: Infinity, points: 10 },
];

function getThresholdPoints(value, thresholds) {
  if (value == null || isNaN(value)) return 0;
  for (const t of thresholds) {
    if (value <= t.max) return t.points;
  }
  return 10;
}

// ── Ingredient Analysis ──

/**
 * Analyze a single ingredient string and return its risk assessment.
 */
export function analyzeIngredient(ingredientStr) {
  if (!ingredientStr) return { name: '', risk: 0, label: 'Neutral', color: RISK_COLORS[1], additive: null };

  const cleaned = ingredientStr.trim();
  const additive = lookupAdditive(cleaned);

  if (additive) {
    return {
      name: cleaned,
      risk: additive.risk,
      label: RISK_LABELS[additive.risk],
      color: RISK_COLORS[additive.risk],
      additive: {
        ins: additive.ins,
        officialName: additive.name,
        category: additive.category,
        description: additive.description,
      },
    };
  }

  // Check for known concerning keywords (not in the additive DB)
  const lowerName = cleaned.toLowerCase();
  const concerningKeywords = [
    { pattern: /hydrogenated/i, risk: 3, description: 'Hydrogenated fats contain trans fats linked to heart disease, increased LDL cholesterol, and stroke.' },
    { pattern: /partially hydrogenated/i, risk: 3, description: 'Partially hydrogenated oils are the primary source of artificial trans fats, a major cardiovascular risk factor.' },
    { pattern: /high fructose corn syrup|hfcs/i, risk: 2, description: 'Heavily processed sweetener linked to obesity, insulin resistance, and fatty liver disease.' },
    { pattern: /palm oil/i, risk: 1, description: 'High in saturated fat. Environmental concerns regarding deforestation.' },
    { pattern: /refined/i, risk: 1, description: 'Refined ingredients have been stripped of fiber and nutrients during processing.' },
    { pattern: /bleached/i, risk: 1, description: 'Bleaching is a chemical process that removes nutrients and may leave residues.' },
    { pattern: /artificial\s*(flavou?r|colour|color)/i, risk: 2, description: 'Artificial flavors/colors are synthetic chemicals. Some are linked to hyperactivity in children.' },
    { pattern: /maida|refined wheat flour|refined flour/i, risk: 1, description: 'Refined flour stripped of fiber and nutrients. High glycemic index — spikes blood sugar.' },
    { pattern: /inverted sugar|invert sugar/i, risk: 1, description: 'Processed sugar that is more quickly absorbed. Contributes to sugar intake.' },
  ];

  for (const keyword of concerningKeywords) {
    if (keyword.pattern.test(cleaned)) {
      return {
        name: cleaned,
        risk: keyword.risk,
        label: RISK_LABELS[keyword.risk],
        color: RISK_COLORS[keyword.risk],
        additive: {
          ins: null,
          officialName: cleaned,
          category: 'ingredient',
          description: keyword.description,
        },
      };
    }
  }

  // Known good ingredients
  const goodKeywords = [
    /whole\s*(wheat|grain)/i,
    /organic/i,
    /\bwater\b/i,
    /\bsalt\b$/i,
    /\bsugar\b$/i,
    /\bmilk\b/i,
    /\bbutter\b/i,
    /\bghee\b/i,
    /\bcurd\b|yogh?urt/i,
    /\bspice/i,
    /\bmasala\b/i,
    /\bturmeric\b|\bhaldi\b/i,
    /\bcumin\b|\bjeera\b/i,
    /\bcoriander\b|\bdhania\b/i,
    /\bchilli\b|\bchili\b|\bmirch\b/i,
    /\bpepper\b/i,
    /\bgarlic\b|\blahsun\b/i,
    /\bginger\b|\badrak\b/i,
    /\bonion\b/i,
    /\btomato\b/i,
    /\brice\b/i,
    /\bwheat\b/i,
    /\bflour\b|\batta\b/i,
    /\bdal\b|\blentil/i,
    /\bchickpea\b|\bchana\b/i,
    /\bcoconut/i,
    /\bjaggery\b|\bgur\b/i,
    /\bhoney\b/i,
    /\bsesame\b|\btil\b/i,
    /\bmustard/i,
    /\bgroundnut\b|\bpeanut/i,
    /\bcashew\b|\bkaju\b/i,
    /\balmond\b|\bbadam\b/i,
    /\bcardamom\b|\belaichi\b/i,
    /\bclove\b|\blaung\b/i,
    /\bcinnamon\b|\bdalchini\b/i,
    /\bfenugreek\b|\bmethi\b/i,
    /\bfennel\b|\bsaunf\b/i,
    /\basafoetida\b|\bhing\b/i,
  ];

  for (const pattern of goodKeywords) {
    if (pattern.test(lowerName)) {
      return {
        name: cleaned,
        risk: 0,
        label: 'Good',
        color: RISK_COLORS[0],
        additive: null,
      };
    }
  }

  // Default: neutral / unknown
  return {
    name: cleaned,
    risk: 1,
    label: 'Neutral',
    color: RISK_COLORS[1],
    additive: null,
  };
}

/**
 * Parse a comma-separated ingredients string into individual ingredients.
 */
export function parseIngredients(ingredientsStr) {
  if (!ingredientsStr) return [];
  return ingredientsStr
    .split(/,(?![^()]*\))/) // Split on commas not inside parentheses
    .map((s) => s.replace(/\([^)]*\)/g, '').trim()) // Remove parenthetical content
    .filter((s) => s.length > 0);
}

/**
 * Analyze all ingredients and return scored list.
 */
export function analyzeAllIngredients(ingredientsStr) {
  const ingredients = parseIngredients(ingredientsStr);
  return ingredients.map(analyzeIngredient);
}

// ── Main Scoring Function ──

/**
 * Score a product and return a comprehensive result.
 *
 * @param {Object} product
 * @param {string} product.ingredients_text - Comma-separated ingredients
 * @param {number} [product.sugar_100g] - Sugar per 100g
 * @param {number} [product.salt_100g] - Salt per 100g
 * @param {number} [product.saturated_fat_100g] - Saturated fat per 100g
 * @param {number} [product.additives_count] - Number of additives (if known)
 *
 * @returns {Object} Scoring result with grade, score, ingredient analysis, nutrition breakdown
 */
export function scoreProduct(product) {
  const {
    ingredients_text = '',
    sugar_100g,
    salt_100g,
    saturated_fat_100g,
    additives_count,
  } = product;

  // 1. Analyze ingredients
  const analyzedIngredients = analyzeAllIngredients(ingredients_text);

  // 2. Calculate additive penalty (0-40 points deducted from 100)
  let additivePenalty = 0;
  let harmfulCount = 0;
  let concerningCount = 0;

  analyzedIngredients.forEach((ing) => {
    if (ing.risk === 3) {
      additivePenalty += 10;
      harmfulCount++;
    } else if (ing.risk === 2) {
      additivePenalty += 5;
      concerningCount++;
    }
  });
  additivePenalty = Math.min(additivePenalty, 40);

  // 3. Calculate nutritional penalty (0-30 points)
  const sugarPoints = getThresholdPoints(sugar_100g, SUGAR_THRESHOLDS);
  const saltPoints = getThresholdPoints(salt_100g, SALT_THRESHOLDS);
  const satFatPoints = getThresholdPoints(saturated_fat_100g, SAT_FAT_THRESHOLDS);

  const nutritionPenalty = Math.min(
    Math.round(((sugarPoints + saltPoints + satFatPoints) / 30) * 30),
    30
  );

  // 4. Processing penalty (0-15 points) based on known additive count
  const detectedAdditives = analyzedIngredients.filter((i) => i.additive && i.additive.ins).length;
  const totalAdditives = additives_count || detectedAdditives;
  let processingPenalty = 0;
  if (totalAdditives >= 8) processingPenalty = 15;
  else if (totalAdditives >= 5) processingPenalty = 10;
  else if (totalAdditives >= 3) processingPenalty = 5;
  else if (totalAdditives >= 1) processingPenalty = 2;

  // 5. Ingredient count penalty (0-15 points) - ultra-processed indicator
  const ingredientCount = analyzedIngredients.length;
  let ingredientCountPenalty = 0;
  if (ingredientCount > 20) ingredientCountPenalty = 15;
  else if (ingredientCount > 15) ingredientCountPenalty = 10;
  else if (ingredientCount > 10) ingredientCountPenalty = 5;

  // 6. Calculate final score (100 - penalties)
  const totalPenalty = additivePenalty + nutritionPenalty + processingPenalty + ingredientCountPenalty;
  const score = Math.max(0, Math.min(100, 100 - totalPenalty));

  // 7. Determine grade
  let grade;
  if (score >= GRADES.A.minScore) grade = GRADES.A;
  else if (score >= GRADES.B.minScore) grade = GRADES.B;
  else if (score >= GRADES.C.minScore) grade = GRADES.C;
  else if (score >= GRADES.D.minScore) grade = GRADES.D;
  else grade = GRADES.E;

  // 8. Nutrition breakdown
  const nutritionBreakdown = {
    sugar: {
      value: sugar_100g,
      unit: 'g/100g',
      points: sugarPoints,
      maxPoints: 10,
      level: sugarPoints <= 3 ? 'low' : sugarPoints <= 6 ? 'moderate' : 'high',
    },
    salt: {
      value: salt_100g,
      unit: 'g/100g',
      points: saltPoints,
      maxPoints: 10,
      level: saltPoints <= 3 ? 'low' : saltPoints <= 6 ? 'moderate' : 'high',
    },
    saturatedFat: {
      value: saturated_fat_100g,
      unit: 'g/100g',
      points: satFatPoints,
      maxPoints: 10,
      level: satFatPoints <= 3 ? 'low' : satFatPoints <= 6 ? 'moderate' : 'high',
    },
    additives: {
      value: totalAdditives,
      unit: 'count',
      level: totalAdditives <= 2 ? 'low' : totalAdditives <= 5 ? 'moderate' : 'high',
    },
  };

  return {
    score,
    grade,
    ingredients: analyzedIngredients,
    nutritionBreakdown,
    penalties: {
      additive: additivePenalty,
      nutrition: nutritionPenalty,
      processing: processingPenalty,
      ingredientCount: ingredientCountPenalty,
      total: totalPenalty,
    },
    stats: {
      totalIngredients: ingredientCount,
      harmfulAdditives: harmfulCount,
      concerningAdditives: concerningCount,
      totalAdditives,
    },
  };
}

export { RISK_LABELS, RISK_COLORS };
