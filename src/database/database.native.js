/**
 * SQLite database layer for LabelScan.
 * Handles local product cache, seed data, and crowdsourced submissions.
 */

import * as SQLite from 'expo-sqlite';
import seedProducts from './seedData';

let db = null;

/**
 * Open (or create) the database and initialize tables.
 */
export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('labelscan.db');

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

  return db;
}

/**
 * Seed the database with common Indian products (idempotent — skips existing).
 */
export async function seedDatabase() {
  if (!db) await initDatabase();

  const existing = await db.getFirstAsync('SELECT COUNT(*) as count FROM products WHERE source = ?', ['seed']);
  if (existing && existing.count >= seedProducts.length) {
    return { seeded: false, count: existing.count };
  }

  for (const product of seedProducts) {
    await db.runAsync(
      `INSERT OR IGNORE INTO products (barcode, name, brand, category, ingredients_text, sugar_100g, salt_100g, saturated_fat_100g, image_url, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'seed')`,
      [
        product.barcode,
        product.name,
        product.brand,
        product.category,
        product.ingredients_text,
        product.sugar_100g,
        product.salt_100g,
        product.saturated_fat_100g,
        product.image_url,
      ]
    );
  }

  return { seeded: true, count: seedProducts.length };
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
    `INSERT OR REPLACE INTO products (barcode, name, brand, category, ingredients_text, sugar_100g, salt_100g, saturated_fat_100g, image_url, source, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      product.barcode,
      product.name,
      product.brand,
      product.category || null,
      product.ingredients_text,
      product.sugar_100g ?? null,
      product.salt_100g ?? null,
      product.saturated_fat_100g ?? null,
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
  const seedCount = await db.getFirstAsync("SELECT COUNT(*) as count FROM products WHERE source = 'seed'");
  const apiCount = await db.getFirstAsync("SELECT COUNT(*) as count FROM products WHERE source = 'api'");
  const userCount = await db.getFirstAsync("SELECT COUNT(*) as count FROM products WHERE source = 'user'");

  return {
    totalProducts: productCount?.count || 0,
    totalSubmissions: submissionCount?.count || 0,
    seedProducts: seedCount?.count || 0,
    apiCached: apiCount?.count || 0,
    userSubmitted: userCount?.count || 0,
  };
}
