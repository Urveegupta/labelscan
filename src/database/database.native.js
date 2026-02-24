/**
 * SQLite database layer for BiteCheck.
 * Handles local product cache and crowdsourced submissions.
 */

import * as SQLite from 'expo-sqlite';

let db = null;

/**
 * Open (or create) the database and initialize tables.
 */
export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('labelscan.db');

  // Create tables if fresh install
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      barcode TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT,
      category TEXT,
      ingredients_text TEXT,
      sugar_100g REAL,
      salt_100g REAL,
      saturated_fat_100g REAL,
      calories_100g REAL,
      protein_100g REAL,
      carbs_100g REAL,
      fat_100g REAL,
      fiber_100g REAL,
      serving_size TEXT,
      calories_serving REAL,
      protein_serving REAL,
      carbs_serving REAL,
      fat_serving REAL,
      fiber_serving REAL,
      sugar_serving REAL,
      salt_serving REAL,
      saturated_fat_serving REAL,
      image_url TEXT,
      source TEXT DEFAULT 'local',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT NOT NULL,
      name TEXT NOT NULL,
      brand TEXT,
      ingredients_text TEXT,
      submitted_at TEXT DEFAULT (datetime('now')),
      synced INTEGER DEFAULT 0
    );
  `);

  // Migrate: add columns that may be missing from older schema versions.
  // ALTER TABLE ADD COLUMN is a no-op if the column already exists in newer SQLite,
  // but older versions throw — so we check first.
  const cols = await db.getAllAsync("PRAGMA table_info(products)");
  const existing = new Set(cols.map((c) => c.name));

  const newColumns = [
    ['calories_100g', 'REAL'],
    ['protein_100g', 'REAL'],
    ['carbs_100g', 'REAL'],
    ['fat_100g', 'REAL'],
    ['fiber_100g', 'REAL'],
    ['serving_size', 'TEXT'],
    ['calories_serving', 'REAL'],
    ['protein_serving', 'REAL'],
    ['carbs_serving', 'REAL'],
    ['fat_serving', 'REAL'],
    ['fiber_serving', 'REAL'],
    ['sugar_serving', 'REAL'],
    ['salt_serving', 'REAL'],
    ['saturated_fat_serving', 'REAL'],
  ];

  for (const [col, type] of newColumns) {
    if (!existing.has(col)) {
      await db.execAsync(`ALTER TABLE products ADD COLUMN ${col} ${type}`);
    }
  }

  return db;
}

/**
 * Look up a product by barcode in the local database.
 */
export async function getProductByBarcode(barcode) {
  if (!db) await initDatabase();
  return db.getFirstAsync('SELECT * FROM products WHERE barcode = ?', [barcode]);
}

/**
 * Save/update a product in the local cache (from API lookups).
 */
export async function cacheProduct(product) {
  if (!db) await initDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO products (barcode, name, brand, category, ingredients_text, sugar_100g, salt_100g, saturated_fat_100g, calories_100g, protein_100g, carbs_100g, fat_100g, fiber_100g, serving_size, calories_serving, protein_serving, carbs_serving, fat_serving, fiber_serving, sugar_serving, salt_serving, saturated_fat_serving, image_url, source, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      product.barcode,
      product.name,
      product.brand,
      product.category || null,
      product.ingredients_text,
      product.sugar_100g ?? null,
      product.salt_100g ?? null,
      product.saturated_fat_100g ?? null,
      product.calories_100g ?? null,
      product.protein_100g ?? null,
      product.carbs_100g ?? null,
      product.fat_100g ?? null,
      product.fiber_100g ?? null,
      product.serving_size ?? null,
      product.calories_serving ?? null,
      product.protein_serving ?? null,
      product.carbs_serving ?? null,
      product.fat_serving ?? null,
      product.fiber_serving ?? null,
      product.sugar_serving ?? null,
      product.salt_serving ?? null,
      product.saturated_fat_serving ?? null,
      product.image_url || null,
      product.source || 'api',
    ]
  );
}

/**
 * Submit a user-contributed product.
 */
export async function submitProduct(submission) {
  if (!db) await initDatabase();

  // Save to submissions log
  await db.runAsync(
    `INSERT INTO submissions (barcode, name, brand, ingredients_text)
     VALUES (?, ?, ?, ?)`,
    [submission.barcode, submission.name, submission.brand, submission.ingredients_text]
  );

  // Also add to products table for immediate local use
  await cacheProduct({
    ...submission,
    source: 'user',
  });

  return true;
}

/**
 * Get all locally stored products (for browsing/search).
 */
export async function getAllProducts() {
  if (!db) await initDatabase();
  return db.getAllAsync('SELECT * FROM products ORDER BY name ASC');
}

/**
 * Search products by name or brand.
 */
export async function searchProducts(query) {
  if (!db) await initDatabase();
  const like = `%${query}%`;
  return db.getAllAsync(
    'SELECT * FROM products WHERE name LIKE ? OR brand LIKE ? ORDER BY name ASC LIMIT 20',
    [like, like]
  );
}

/**
 * Get recent user submissions.
 */
export async function getRecentSubmissions(limit = 10) {
  if (!db) await initDatabase();
  return db.getAllAsync(
    'SELECT * FROM submissions ORDER BY submitted_at DESC LIMIT ?',
    [limit]
  );
}

/**
 * Get database stats.
 */
export async function getDatabaseStats() {
  if (!db) await initDatabase();
  const productCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM products');
  const submissionCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM submissions');
  const apiCount = await db.getFirstAsync("SELECT COUNT(*) as count FROM products WHERE source = 'api'");
  const userCount = await db.getFirstAsync("SELECT COUNT(*) as count FROM products WHERE source = 'user'");

  return {
    totalProducts: productCount?.count || 0,
    totalSubmissions: submissionCount?.count || 0,
    apiCached: apiCount?.count || 0,
    userSubmitted: userCount?.count || 0,
  };
}
