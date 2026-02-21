/**
 * Web database layer for LabelScan.
 * Uses localStorage as a lightweight replacement for expo-sqlite.
 * Same 8 exported functions as database.native.js.
 */

import seedProducts from './seedData';

const PRODUCTS_KEY = 'labelscan_products';
const SUBMISSIONS_KEY = 'labelscan_submissions';

function getProducts() {
  try {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function getSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(SUBMISSIONS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveSubmissions(submissions) {
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
}

export async function initDatabase() {
  // No-op on web — localStorage is always ready
}

export async function seedDatabase() {
  const products = getProducts();
  const seedCount = Object.values(products).filter((p) => p.source === 'seed').length;

  if (seedCount >= seedProducts.length) {
    return { seeded: false, count: seedCount };
  }

  for (const product of seedProducts) {
    if (!products[product.barcode]) {
      products[product.barcode] = {
        ...product,
        source: 'seed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  }

  saveProducts(products);
  return { seeded: true, count: seedProducts.length };
}

export async function getProductByBarcode(barcode) {
  const products = getProducts();
  return products[barcode] || null;
}

export async function cacheProduct(product) {
  const products = getProducts();
  products[product.barcode] = {
    ...products[product.barcode],
    ...product,
    source: product.source || 'api',
    updated_at: new Date().toISOString(),
    created_at: products[product.barcode]?.created_at || new Date().toISOString(),
  };
  saveProducts(products);
}

export async function submitProduct(submission) {
  const submissions = getSubmissions();
  submissions.unshift({
    id: Date.now(),
    barcode: submission.barcode,
    name: submission.name,
    brand: submission.brand,
    ingredients_text: submission.ingredients_text,
    submitted_at: new Date().toISOString(),
    synced: 0,
  });
  saveSubmissions(submissions);

  await cacheProduct({
    ...submission,
    source: 'user',
  });

  return true;
}

export async function getAllProducts() {
  const products = getProducts();
  return Object.values(products).sort((a, b) =>
    (a.name || '').localeCompare(b.name || '')
  );
}

export async function searchProducts(query) {
  const products = getProducts();
  const lower = query.toLowerCase();
  return Object.values(products)
    .filter(
      (p) =>
        (p.name || '').toLowerCase().includes(lower) ||
        (p.brand || '').toLowerCase().includes(lower)
    )
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .slice(0, 20);
}

export async function getRecentSubmissions(limit = 10) {
  const submissions = getSubmissions();
  return submissions.slice(0, limit);
}

export async function getDatabaseStats() {
  const products = getProducts();
  const submissions = getSubmissions();
  const values = Object.values(products);

  return {
    totalProducts: values.length,
    totalSubmissions: submissions.length,
    seedProducts: values.filter((p) => p.source === 'seed').length,
    apiCached: values.filter((p) => p.source === 'api').length,
    userSubmitted: values.filter((p) => p.source === 'user').length,
  };
}
