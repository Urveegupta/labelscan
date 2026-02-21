/**
 * Comprehensive database of food additives common in Indian packaged foods.
 * Uses INS (International Numbering System) numbers as used by FSSAI.
 *
 * Risk levels:
 *   0 = Good (safe, natural origin)
 *   1 = Neutral (generally safe, minor concerns)
 *   2 = Concerning (moderate risk, some studies show adverse effects)
 *   3 = Harmful (strong evidence of adverse effects, banned in some countries)
 */

export const RISK_LABELS = ['Good', 'Neutral', 'Concerning', 'Harmful'];

export const RISK_COLORS = {
  0: '#4CAF50', // green
  1: '#8BC34A', // light green
  2: '#FF9800', // orange
  3: '#F44336', // red
};

const additives = [
  // ── Colors ──
  { ins: '100', name: 'Curcumin', aliases: ['turmeric extract', 'curcumin'], risk: 0, category: 'color', description: 'Natural yellow color from turmeric. Safe and has anti-inflammatory properties.' },
  { ins: '101', name: 'Riboflavin', aliases: ['vitamin b2', 'riboflavin'], risk: 0, category: 'color', description: 'Vitamin B2 used as yellow food color. Safe — it\'s a vitamin your body needs.' },
  { ins: '102', name: 'Tartrazine', aliases: ['tartrazine', 'fd&c yellow 5', 'yellow 5'], risk: 3, category: 'color', description: 'Synthetic yellow dye linked to hyperactivity in children, allergic reactions, and asthma. Banned in Norway and Austria.' },
  { ins: '110', name: 'Sunset Yellow FCF', aliases: ['sunset yellow', 'fd&c yellow 6', 'yellow 6'], risk: 3, category: 'color', description: 'Synthetic orange-yellow dye linked to hyperactivity in children and allergic reactions.' },
  { ins: '120', name: 'Carmines', aliases: ['carmine', 'cochineal', 'natural red 4'], risk: 1, category: 'color', description: 'Natural red dye from insects. Generally safe but can cause allergic reactions in some people.' },
  { ins: '122', name: 'Azorubine', aliases: ['azorubine', 'carmoisine'], risk: 2, category: 'color', description: 'Synthetic red dye. May cause allergic reactions and hyperactivity in children.' },
  { ins: '123', name: 'Amaranth', aliases: ['amaranth dye'], risk: 3, category: 'color', description: 'Synthetic red dye banned in the US. Linked to tumors in animal studies.' },
  { ins: '124', name: 'Ponceau 4R', aliases: ['ponceau 4r', 'brilliant scarlet'], risk: 2, category: 'color', description: 'Synthetic red dye. May trigger allergic reactions and hyperactivity in children.' },
  { ins: '127', name: 'Erythrosine', aliases: ['erythrosine', 'fd&c red 3', 'red 3'], risk: 2, category: 'color', description: 'Synthetic cherry-pink dye. Linked to thyroid issues in animal studies.' },
  { ins: '129', name: 'Allura Red AC', aliases: ['allura red', 'fd&c red 40', 'red 40'], risk: 2, category: 'color', description: 'Synthetic red dye. May cause hyperactivity in children and allergic reactions.' },
  { ins: '131', name: 'Patent Blue V', aliases: ['patent blue'], risk: 2, category: 'color', description: 'Synthetic blue dye. May cause allergic reactions including anaphylaxis in rare cases.' },
  { ins: '132', name: 'Indigotine', aliases: ['indigotine', 'indigo carmine', 'fd&c blue 2'], risk: 1, category: 'color', description: 'Synthetic blue dye. Generally considered low risk but may cause nausea in sensitive individuals.' },
  { ins: '133', name: 'Brilliant Blue FCF', aliases: ['brilliant blue', 'fd&c blue 1'], risk: 1, category: 'color', description: 'Synthetic blue dye. Low risk but poorly absorbed — passes through the body.' },
  { ins: '140', name: 'Chlorophylls', aliases: ['chlorophyll', 'chlorophyllin'], risk: 0, category: 'color', description: 'Natural green color from plants. Safe.' },
  { ins: '141', name: 'Copper Complexes of Chlorophyll', aliases: ['copper chlorophyll', 'copper chlorophyllin'], risk: 0, category: 'color', description: 'Modified natural green color. Safe in food-grade quantities.' },
  { ins: '150a', name: 'Plain Caramel', aliases: ['caramel color', 'plain caramel'], risk: 0, category: 'color', description: 'Simple caramel made by heating sugar. Safe.' },
  { ins: '150d', name: 'Sulfite Ammonia Caramel', aliases: ['caramel color iv', 'sulfite ammonia caramel'], risk: 2, category: 'color', description: 'Industrial caramel color containing 4-MEI, a possible carcinogen. Found in colas and soy sauce.' },
  { ins: '160a', name: 'Beta-Carotene', aliases: ['beta carotene', 'beta-carotene', 'provitamin a'], risk: 0, category: 'color', description: 'Natural orange color, precursor to Vitamin A. Safe and beneficial.' },
  { ins: '160b', name: 'Annatto', aliases: ['annatto', 'bixin', 'norbixin'], risk: 0, category: 'color', description: 'Natural orange-red color from seeds. Generally safe.' },
  { ins: '171', name: 'Titanium Dioxide', aliases: ['titanium dioxide', 'tio2'], risk: 2, category: 'color', description: 'White pigment. Recently banned in EU as food additive due to genotoxicity concerns.' },

  // ── Preservatives ──
  { ins: '200', name: 'Sorbic Acid', aliases: ['sorbic acid'], risk: 0, category: 'preservative', description: 'Natural preservative found in berries. Safe.' },
  { ins: '201', name: 'Sodium Sorbate', aliases: ['sodium sorbate'], risk: 0, category: 'preservative', description: 'Salt of sorbic acid. Safe preservative.' },
  { ins: '202', name: 'Potassium Sorbate', aliases: ['potassium sorbate'], risk: 0, category: 'preservative', description: 'Common preservative. Safe at food-grade levels.' },
  { ins: '210', name: 'Benzoic Acid', aliases: ['benzoic acid'], risk: 2, category: 'preservative', description: 'Can form benzene (a carcinogen) when combined with vitamin C. May trigger asthma and hives.' },
  { ins: '211', name: 'Sodium Benzoate', aliases: ['sodium benzoate'], risk: 3, category: 'preservative', description: 'Preservative linked to hyperactivity in children. Can form benzene (a carcinogen) when combined with vitamin C in beverages.' },
  { ins: '212', name: 'Potassium Benzoate', aliases: ['potassium benzoate'], risk: 2, category: 'preservative', description: 'Similar concerns as sodium benzoate. Can form benzene with vitamin C.' },
  { ins: '220', name: 'Sulfur Dioxide', aliases: ['sulfur dioxide', 'sulphur dioxide', 'so2'], risk: 2, category: 'preservative', description: 'Preservative that can trigger severe asthma attacks and allergic reactions in sensitive individuals.' },
  { ins: '221', name: 'Sodium Sulfite', aliases: ['sodium sulfite', 'sodium sulphite'], risk: 2, category: 'preservative', description: 'Sulfite preservative. Can trigger asthma and allergic reactions.' },
  { ins: '223', name: 'Sodium Metabisulfite', aliases: ['sodium metabisulfite', 'sodium metabisulphite'], risk: 2, category: 'preservative', description: 'Sulfite preservative common in dried fruits. Dangerous for asthmatics.' },
  { ins: '224', name: 'Potassium Metabisulfite', aliases: ['potassium metabisulfite', 'potassium metabisulphite'], risk: 2, category: 'preservative', description: 'Sulfite preservative. Same concerns as other sulfites.' },
  { ins: '234', name: 'Nisin', aliases: ['nisin'], risk: 0, category: 'preservative', description: 'Natural antimicrobial from bacteria. Safe and effective preservative.' },
  { ins: '249', name: 'Potassium Nitrite', aliases: ['potassium nitrite'], risk: 3, category: 'preservative', description: 'Can form cancer-causing nitrosamines. Used in cured meats.' },
  { ins: '250', name: 'Sodium Nitrite', aliases: ['sodium nitrite'], risk: 3, category: 'preservative', description: 'Forms cancer-causing nitrosamines in the body. Used in processed meats. IARC classifies processed meat as carcinogenic.' },
  { ins: '251', name: 'Sodium Nitrate', aliases: ['sodium nitrate'], risk: 2, category: 'preservative', description: 'Converts to nitrite in the body, which can form nitrosamines. Used in cured meats.' },
  { ins: '252', name: 'Potassium Nitrate', aliases: ['potassium nitrate', 'saltpetre', 'saltpeter'], risk: 2, category: 'preservative', description: 'Converts to nitrite in the body. Used in cured meats.' },
  { ins: '270', name: 'Lactic Acid', aliases: ['lactic acid'], risk: 0, category: 'preservative', description: 'Naturally occurring acid found in fermented foods. Safe.' },
  { ins: '280', name: 'Propionic Acid', aliases: ['propionic acid'], risk: 0, category: 'preservative', description: 'Naturally produced in the body. Safe preservative commonly used in bread.' },
  { ins: '296', name: 'Malic Acid', aliases: ['malic acid'], risk: 0, category: 'preservative', description: 'Naturally found in apples. Safe acidity regulator.' },
  { ins: '297', name: 'Fumaric Acid', aliases: ['fumaric acid'], risk: 0, category: 'preservative', description: 'Naturally occurring acid. Safe in food-grade quantities.' },

  // ── Antioxidants ──
  { ins: '300', name: 'Ascorbic Acid', aliases: ['ascorbic acid', 'vitamin c'], risk: 0, category: 'antioxidant', description: 'Vitamin C. Safe and essential nutrient.' },
  { ins: '306', name: 'Mixed Tocopherols', aliases: ['tocopherols', 'vitamin e', 'mixed tocopherols'], risk: 0, category: 'antioxidant', description: 'Vitamin E. Safe and beneficial antioxidant.' },
  { ins: '307', name: 'Alpha-Tocopherol', aliases: ['alpha-tocopherol', 'dl-alpha-tocopherol'], risk: 0, category: 'antioxidant', description: 'Synthetic vitamin E. Safe.' },
  { ins: '319', name: 'TBHQ', aliases: ['tbhq', 'tertiary butylhydroquinone', 'tert-butylhydroquinone'], risk: 2, category: 'antioxidant', description: 'Synthetic antioxidant. High doses linked to stomach tumors in animal studies. Common in instant noodles and cooking oils.' },
  { ins: '320', name: 'BHA', aliases: ['bha', 'butylated hydroxyanisole'], risk: 3, category: 'antioxidant', description: 'Synthetic antioxidant. Classified as "reasonably anticipated to be a human carcinogen" by the US National Toxicology Program.' },
  { ins: '321', name: 'BHT', aliases: ['bht', 'butylated hydroxytoluene'], risk: 2, category: 'antioxidant', description: 'Synthetic antioxidant. Mixed evidence — some studies show tumor promotion. Banned in some countries.' },
  { ins: '330', name: 'Citric Acid', aliases: ['citric acid'], risk: 0, category: 'antioxidant', description: 'Naturally found in citrus fruits. Safe and widely used.' },
  { ins: '334', name: 'Tartaric Acid', aliases: ['tartaric acid'], risk: 0, category: 'antioxidant', description: 'Naturally found in grapes. Safe.' },

  // ── Emulsifiers & Stabilizers ──
  { ins: '322', name: 'Lecithins', aliases: ['lecithin', 'soy lecithin', 'soya lecithin', 'sunflower lecithin'], risk: 0, category: 'emulsifier', description: 'Natural emulsifier from soy or sunflower. Safe — also a source of choline.' },
  { ins: '407', name: 'Carrageenan', aliases: ['carrageenan'], risk: 2, category: 'stabilizer', description: 'Seaweed-derived thickener. Some studies link it to gut inflammation and digestive issues.' },
  { ins: '412', name: 'Guar Gum', aliases: ['guar gum'], risk: 0, category: 'stabilizer', description: 'Natural thickener from guar beans (Indian crop). Safe and may aid digestion.' },
  { ins: '414', name: 'Gum Arabic', aliases: ['gum arabic', 'acacia gum'], risk: 0, category: 'stabilizer', description: 'Natural tree gum. Safe and well-tolerated.' },
  { ins: '415', name: 'Xanthan Gum', aliases: ['xanthan gum'], risk: 0, category: 'stabilizer', description: 'Fermentation-derived thickener. Safe and commonly used.' },
  { ins: '420', name: 'Sorbitol', aliases: ['sorbitol'], risk: 1, category: 'sweetener', description: 'Sugar alcohol. Safe in small amounts but can cause digestive discomfort in large quantities.' },
  { ins: '422', name: 'Glycerol', aliases: ['glycerol', 'glycerin', 'glycerine'], risk: 0, category: 'humectant', description: 'Natural compound. Safe humectant and sweetener.' },
  { ins: '433', name: 'Polysorbate 80', aliases: ['polysorbate 80', 'tween 80'], risk: 2, category: 'emulsifier', description: 'Synthetic emulsifier. Animal studies suggest it may promote gut inflammation and metabolic syndrome.' },
  { ins: '440', name: 'Pectins', aliases: ['pectin', 'pectins'], risk: 0, category: 'stabilizer', description: 'Natural plant fiber. Safe and may help lower cholesterol.' },
  { ins: '442', name: 'Ammonium Phosphatides', aliases: ['ammonium phosphatide', 'ammonium phosphatides'], risk: 0, category: 'emulsifier', description: 'Emulsifier used in chocolate. Safe.' },
  { ins: '450', name: 'Diphosphates', aliases: ['diphosphate', 'sodium acid pyrophosphate', 'disodium diphosphate'], risk: 1, category: 'emulsifier', description: 'Phosphate additive. Excessive phosphate intake may affect kidney health and bone density.' },
  { ins: '451', name: 'Triphosphates', aliases: ['triphosphate', 'sodium triphosphate', 'pentasodium triphosphate'], risk: 1, category: 'emulsifier', description: 'Phosphate additive. Same concerns as other phosphates regarding kidney and bone health.' },
  { ins: '452', name: 'Polyphosphates', aliases: ['polyphosphate', 'sodium polyphosphate'], risk: 1, category: 'emulsifier', description: 'Phosphate additive. High phosphate intake linked to cardiovascular risk.' },
  { ins: '460', name: 'Cellulose', aliases: ['cellulose', 'microcrystalline cellulose', 'powdered cellulose'], risk: 0, category: 'stabilizer', description: 'Plant fiber. Safe and indigestible — passes through the body.' },
  { ins: '466', name: 'Sodium CMC', aliases: ['sodium cmc', 'carboxymethyl cellulose', 'cellulose gum'], risk: 1, category: 'stabilizer', description: 'Modified cellulose. Recent studies suggest it may affect gut microbiome.' },
  { ins: '471', name: 'Mono- and Diglycerides', aliases: ['mono and diglycerides', 'mono- and diglycerides of fatty acids', 'e471'], risk: 1, category: 'emulsifier', description: 'Fat-based emulsifier. Generally safe but may contain trans fats depending on source.' },
  { ins: '481', name: 'Sodium Stearoyl Lactylate', aliases: ['sodium stearoyl lactylate', 'ssl'], risk: 0, category: 'emulsifier', description: 'Dough conditioner. Safe and well-studied.' },

  // ── Sweeteners ──
  { ins: '950', name: 'Acesulfame K', aliases: ['acesulfame k', 'acesulfame potassium', 'ace-k'], risk: 2, category: 'sweetener', description: 'Artificial sweetener. Some studies suggest it may affect gut bacteria and insulin response.' },
  { ins: '951', name: 'Aspartame', aliases: ['aspartame'], risk: 2, category: 'sweetener', description: 'Artificial sweetener. IARC classifies it as "possibly carcinogenic to humans". May cause headaches in sensitive individuals.' },
  { ins: '952', name: 'Cyclamate', aliases: ['cyclamate', 'sodium cyclamate'], risk: 3, category: 'sweetener', description: 'Artificial sweetener banned in the US since 1969 due to cancer concerns in animal studies.' },
  { ins: '954', name: 'Saccharin', aliases: ['saccharin', 'sodium saccharin'], risk: 2, category: 'sweetener', description: 'Oldest artificial sweetener. Previously linked to bladder cancer in rats, though human evidence is unclear.' },
  { ins: '955', name: 'Sucralose', aliases: ['sucralose', 'splenda'], risk: 1, category: 'sweetener', description: 'Artificial sweetener. Generally considered safe but recent studies raise questions about gut bacteria effects.' },
  { ins: '960', name: 'Steviol Glycosides', aliases: ['stevia', 'steviol glycosides', 'rebaudioside'], risk: 0, category: 'sweetener', description: 'Natural sweetener from stevia plant. Safe.' },
  { ins: '961', name: 'Neotame', aliases: ['neotame'], risk: 1, category: 'sweetener', description: 'Artificial sweetener similar to aspartame. Limited long-term studies available.' },
  { ins: '962', name: 'Aspartame-Acesulfame Salt', aliases: ['aspartame-acesulfame salt'], risk: 2, category: 'sweetener', description: 'Combination of two artificial sweeteners. Carries concerns of both aspartame and acesulfame K.' },
  { ins: '965', name: 'Maltitol', aliases: ['maltitol'], risk: 1, category: 'sweetener', description: 'Sugar alcohol. Safe but can cause digestive issues (bloating, diarrhea) in large amounts.' },
  { ins: '967', name: 'Xylitol', aliases: ['xylitol'], risk: 1, category: 'sweetener', description: 'Sugar alcohol. Safe for humans (beneficial for teeth) but toxic to dogs.' },

  // ── Flavor Enhancers ──
  { ins: '620', name: 'Glutamic Acid', aliases: ['glutamic acid'], risk: 1, category: 'flavor_enhancer', description: 'Naturally occurring amino acid. Safe for most but may cause sensitivity in some.' },
  { ins: '621', name: 'Monosodium Glutamate', aliases: ['msg', 'monosodium glutamate', 'ajinomoto'], risk: 1, category: 'flavor_enhancer', description: 'Common flavor enhancer (Ajinomoto). Safe per scientific consensus but some people report sensitivity (headache, flushing).' },
  { ins: '627', name: 'Disodium Guanylate', aliases: ['disodium guanylate'], risk: 1, category: 'flavor_enhancer', description: 'Flavor enhancer often used with MSG. Avoid if you have gout — it\'s a purine.' },
  { ins: '631', name: 'Disodium Inosinate', aliases: ['disodium inosinate'], risk: 1, category: 'flavor_enhancer', description: 'Flavor enhancer often used with MSG. Avoid if you have gout.' },
  { ins: '635', name: 'Disodium Ribonucleotides', aliases: ['disodium 5-ribonucleotides', 'disodium ribonucleotides', 'i+g'], risk: 1, category: 'flavor_enhancer', description: 'Combination of 627 and 631. Common in chips and instant noodles. Avoid with gout.' },

  // ── Acids & Acidity Regulators ──
  { ins: '260', name: 'Acetic Acid', aliases: ['acetic acid', 'vinegar'], risk: 0, category: 'acidity_regulator', description: 'Vinegar. Safe and naturally occurring.' },
  { ins: '262', name: 'Sodium Acetate', aliases: ['sodium acetate', 'sodium diacetate'], risk: 0, category: 'acidity_regulator', description: 'Salt of acetic acid. Safe.' },
  { ins: '270i', name: 'Lactic Acid (L-)', aliases: ['l-lactic acid', 'l(+)-lactic acid'], risk: 0, category: 'acidity_regulator', description: 'Natural acid from fermentation. Safe.' },
  { ins: '290', name: 'Carbon Dioxide', aliases: ['carbon dioxide', 'co2', 'carbonation'], risk: 0, category: 'propellant', description: 'Makes drinks fizzy. Completely safe.' },
  { ins: '338', name: 'Phosphoric Acid', aliases: ['phosphoric acid'], risk: 2, category: 'acidity_regulator', description: 'Used in colas. Linked to reduced bone density and dental erosion with heavy consumption.' },
  { ins: '500', name: 'Sodium Carbonates', aliases: ['sodium carbonate', 'sodium bicarbonate', 'baking soda'], risk: 0, category: 'raising_agent', description: 'Baking soda. Safe and widely used.' },
  { ins: '501', name: 'Potassium Carbonates', aliases: ['potassium carbonate'], risk: 0, category: 'raising_agent', description: 'Alkaline salt. Safe in food-grade quantities.' },
  { ins: '503', name: 'Ammonium Carbonates', aliases: ['ammonium carbonate', 'ammonium bicarbonate'], risk: 0, category: 'raising_agent', description: 'Leavening agent. Safe — decomposes during baking.' },
  { ins: '551', name: 'Silicon Dioxide', aliases: ['silicon dioxide', 'silica'], risk: 0, category: 'anti-caking', description: 'Anti-caking agent. Safe — passes through the body undigested.' },
];

/**
 * Build lookup maps for fast access
 */
const additivesByINS = new Map();
const additivesByName = new Map();

additives.forEach((additive) => {
  additivesByINS.set(additive.ins, additive);
  additivesByName.set(additive.name.toLowerCase(), additive);
  additive.aliases.forEach((alias) => {
    additivesByName.set(alias.toLowerCase(), additive);
  });
});

/**
 * Look up an additive by INS number (e.g. '211') or name (e.g. 'sodium benzoate')
 */
export function lookupAdditive(query) {
  if (!query) return null;
  const q = String(query).trim().toLowerCase();

  // Try INS number first (strip leading 'ins' or 'e')
  const insMatch = q.replace(/^(ins\s*|e\s*)/, '');
  if (additivesByINS.has(insMatch)) {
    return additivesByINS.get(insMatch);
  }

  // Try exact name match
  if (additivesByName.has(q)) {
    return additivesByName.get(q);
  }

  // Try partial match
  for (const [key, additive] of additivesByName) {
    if (key.includes(q) || q.includes(key)) {
      return additive;
    }
  }

  return null;
}

/**
 * Get all additives
 */
export function getAllAdditives() {
  return [...additives];
}

export default additives;
