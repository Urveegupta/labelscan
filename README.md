# LabelScan

A Yuka-style food product scanner for the Indian market. Scan barcodes to get instant health scores, ingredient analysis, and nutritional breakdowns for packaged food products.

## Features

- **Barcode scanning** — EAN-13, EAN-8, UPC-A, UPC-E support via device camera
- **Health scoring** — A/B/C/D/E grades based on additives, nutrition, and processing level
- **Ingredient analysis** — Each ingredient color-coded as Good / Neutral / Concerning / Harmful with plain-English explanations
- **Nutrition breakdown** — Sugar, salt, saturated fat, and additive counts with traffic-light indicators
- **Offline-first** — 50 popular Indian products pre-loaded (Parle-G, Maggi, Amul, Haldiram's, etc.)
- **API integration** — Pulls from Open Food Facts for products not in local DB
- **Crowdsource** — Users can manually add products not found in either source

## Quick Start

```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

Scan the QR code with Expo Go on your phone to test on a real device.

## Project Structure

```
labelscan/
├── app/                          # Expo Router screens
│   ├── _layout.js               # Root layout (DB init, navigation config)
│   ├── index.js                 # Home screen (search, scan button)
│   ├── scanner.js               # Barcode scanner camera view
│   ├── add-product.js           # Manual product submission form
│   └── product/
│       └── [barcode].js         # Product detail (score, ingredients, nutrition)
├── src/
│   ├── engine/                  # Standalone scoring module
│   │   ├── additives.js         # ~80 common food additives with INS numbers
│   │   └── scoringEngine.js     # Scoring algorithm (testable independently)
│   ├── database/
│   │   ├── database.js          # SQLite setup, queries, CRUD operations
│   │   └── seedData.js          # 50 pre-loaded Indian products
│   ├── api/
│   │   ├── openFoodFacts.js     # Open Food Facts API client
│   │   └── productService.js    # Unified lookup (API → local DB fallback)
│   ├── components/
│   │   ├── ScoreBadge.js        # Color-coded A-E health score badge
│   │   ├── IngredientList.js    # Expandable ingredient list with risk flags
│   │   └── NutritionBreakdown.js # Sugar/salt/fat/additive breakdown cards
│   └── constants/
│       ├── colors.js            # App color palette
│       └── strings.js           # UI strings (ready for Hindi localization)
├── app.json                     # Expo config
└── package.json
```

## Scoring Engine

The scoring engine (`src/engine/scoringEngine.js`) is a standalone module that can be imported and tested independently:

```javascript
import { scoreProduct, analyzeIngredient } from './src/engine/scoringEngine';

// Score a full product
const result = scoreProduct({
  ingredients_text: 'Wheat Flour (Maida), Sugar, Palm Oil, INS 211, INS 102',
  sugar_100g: 25,
  salt_100g: 1.5,
  saturated_fat_100g: 10,
});

console.log(result.grade);       // { letter: 'D', label: 'Poor', color: '#EE8100', ... }
console.log(result.score);       // 28
console.log(result.ingredients); // Array of analyzed ingredients with risk levels

// Analyze a single ingredient
const ing = analyzeIngredient('Sodium Benzoate');
console.log(ing.label);          // 'Harmful'
console.log(ing.additive.description); // 'Preservative linked to hyperactivity...'
```

### Scoring Methodology

Score starts at 100 and deductions are applied:

| Category | Max Penalty | Based On |
|----------|-------------|----------|
| Harmful additives | -40 | -10 per harmful, -5 per concerning |
| Nutrition | -30 | Sugar + salt + saturated fat per 100g |
| Processing level | -15 | Number of detected additives |
| Ingredient count | -15 | Total ingredient count (ultra-processing indicator) |

Grades: **A** (80-100), **B** (60-79), **C** (40-59), **D** (20-39), **E** (0-19)

## Adding Products to Local Database

### Via the app
1. Scan a barcode that isn't found
2. Tap "Add Product"
3. Enter name, brand, and ingredients from the label
4. Submit — product is immediately available locally

### Via seed data
Edit `src/database/seedData.js` and add a new entry:

```javascript
{
  barcode: '1234567890123',
  name: 'Product Name',
  brand: 'Brand',
  category: 'snacks',
  ingredients_text: 'Ingredient 1, Ingredient 2, INS 211, ...',
  sugar_100g: 10.0,    // grams per 100g (null if unknown)
  salt_100g: 1.5,
  saturated_fat_100g: 5.0,
  image_url: null,
}
```

The seed data is loaded on first app launch and skips any products already in the database.

## Additive Database

The additive database (`src/engine/additives.js`) contains ~80 entries covering:
- **Colors** — INS 100-171 (Tartrazine, Sunset Yellow, etc.)
- **Preservatives** — INS 200-297 (Sodium Benzoate, Nitrites, Sulfites, etc.)
- **Antioxidants** — INS 300-334 (BHA, BHT, TBHQ, Citric Acid, etc.)
- **Emulsifiers & Stabilizers** — INS 322-551 (Lecithin, Carrageenan, Guar Gum, etc.)
- **Sweeteners** — INS 950-967 (Aspartame, Saccharin, Stevia, etc.)
- **Flavor enhancers** — INS 620-635 (MSG, etc.)
- **Acidity regulators** — INS 260-551 (Phosphoric Acid, Baking Soda, etc.)

Each entry includes INS number, common names/aliases, risk level (0-3), category, and a plain-English description of health concerns.

## Tech Stack

- **React Native (Expo SDK 54)** — Cross-platform iOS/Android
- **expo-router** — File-based navigation
- **expo-camera** — Barcode scanning (CameraView with barcode settings)
- **expo-sqlite** — Local product cache and crowdsourced submissions
- **Open Food Facts API** — Live product lookups
- **No backend** — Everything runs locally + Open Food Facts

## Data Sources

1. **Open Food Facts** — Primary lookup source (decent Indian product coverage)
2. **Local seed database** — 50 common Indian products with hand-verified ingredient data
3. **User submissions** — Crowdsourced products stored locally

## Future Roadmap (Not in MVP)

- Hindi/regional language support (string infrastructure already in place)
- User accounts and cloud sync for submissions
- Cosmetics scanning
- Barcode-less scanning (OCR ingredient list from photo)
- Price comparison
- Healthier alternative suggestions

## License

MIT
