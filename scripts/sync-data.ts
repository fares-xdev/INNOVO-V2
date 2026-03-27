/**
 * Static Data Sync Script
 * 
 * Fetches all data from WordPress/WooCommerce APIs and writes static JSON files
 * to public/data/ for the frontend to consume.
 * 
 * Usage: npx tsx scripts/sync-data.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_CORE = "https://innovo-eg.com/wp-json/wp/v2";
const API_BASE_STORE = "https://innovo-eg.com/wp-json/wc/store";
const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'data');

const BRAND_ATTR_ID = 1;
const CATEGORY_ATTR_ID = 5;

// Basic Types
interface WCProduct {
  id: number;
  [key: string]: any;
}

// ─── Helpers ───────────────────────────────────────────────

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeJSON(filename: string, data: unknown) {
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  const size = (fs.statSync(filepath).size / 1024).toFixed(1);
  console.log(`  ✓ ${filename} (${size} KB)`);
}

async function fetchJSON(url: string): Promise<{ data: any; headers: Headers }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  const data = await response.json();
  return { data, headers: response.headers };
}

/**
 * Paginate through a WordPress REST API endpoint until all items are fetched.
 */
async function fetchAllPages(baseUrl: string, perPage = 100): Promise<any[]> {
  const separator = baseUrl.includes('?') ? '&' : '?';
  let page = 1;
  let allItems: any[] = [];
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${baseUrl}${separator}per_page=${perPage}&page=${page}`;
    const { data, headers } = await fetchJSON(url);

    if (!Array.isArray(data)) {
      // Some endpoints return a single object or error
      return data ? [data] : [];
    }

    allItems = allItems.concat(data);

    if (page === 1) {
      totalPages = parseInt(headers.get("X-WP-TotalPages") || "1", 10);
      const total = headers.get("X-WP-Total") || "?";
      console.log(`    → ${total} items across ${totalPages} pages`);
    }

    page++;
  }

  return allItems;
}

// ─── Data Fetchers ─────────────────────────────────────────

async function syncProducts(): Promise<any[]> {
  console.log("\n📦 Syncing Products...");
  const products = await fetchAllPages(`${API_BASE_STORE}/products?`);

  // Enrich each product with download links from Core API (parallel batches)
  console.log("    → Fetching download links for each product (parallel batches)...");
  let enrichedDownloads = 0;
  const BATCH_SIZE = 10;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (product) => {
      try {
        const { data: coreData } = await fetchJSON(`${API_BASE_CORE}/product/${product.id}`);
        if (coreData?.downloads?.length) {
          product.downloads = coreData.downloads.map((d: any) => ({
            label: d.label || d.name || 'Download',
            url: d.url || d.file,
          }));
          enrichedDownloads++;
        }
      } catch { /* Skip */ }
    }));
    process.stdout.write(`\r      Progress: ${Math.min(i + BATCH_SIZE, products.length)}/${products.length}`);
  }
  console.log(`\n    → Enriched ${enrichedDownloads} products with download links`);

  // ENRICH WITH MISSING ATTRIBUTES (Brands & Categories)
  // Store API sometimes omits global attributes from the main list.
  // We fetch products per term and inject them back.
  console.log("    → Enriching missing attributes (Brands & Categories)...");

  const enrichAttribute = async (attrId: number, taxonomy: string, name: string) => {
    const { data: terms } = await fetchJSON(`${API_BASE_STORE}/products/attributes/${attrId}/terms`);
    if (!Array.isArray(terms)) return;
    
    for (const term of terms) {
      if (term.count === 0) continue;
      const termProducts = await fetchAllPages(`${API_BASE_STORE}/products?attributes[0][attribute]=${taxonomy}&attributes[0][term_id]=${term.id}`);
      for (const tp of termProducts) {
        const p = products.find(prod => prod.id === tp.id);
        if (p) {
          if (!p.attributes) p.attributes = [];
          let attr = p.attributes.find((a: any) => a.id === attrId);
          if (!attr) {
            attr = { id: attrId, name, taxonomy, terms: [] };
            p.attributes.push(attr);
          }
          if (!attr.terms.find((t: any) => t.id === term.id)) {
            attr.terms.push({ id: term.id, name: term.name, slug: term.slug });
          }
        }
      }
      process.stdout.write(`\r      Injected ${name} term: ${term.name}`);
    }
    console.log(`\n      ✓ ${name} enrichment complete`);
  };

  await enrichAttribute(BRAND_ATTR_ID, 'pa_brand', 'Brand');
  await enrichAttribute(CATEGORY_ATTR_ID, 'pa_category_furniture', 'Category');

  writeJSON('products.json', products);
  return products;
}

async function syncProductFilters() {
  console.log("\n🏷️  Syncing Product Filters...");

  // Categories (WC Store)
  console.log("  Fetching product categories...");
  const { data: categories } = await fetchJSON(`${API_BASE_STORE}/products/categories?per_page=100`);
  writeJSON('product-categories.json', Array.isArray(categories) ? categories.filter((c: any) => (c.count || 0) > 0) : []);

  // Brand attributes
  console.log("  Fetching brand terms (attribute ID: 1)...");
  const { data: brands } = await fetchJSON(`${API_BASE_STORE}/products/attributes/${BRAND_ATTR_ID}/terms`);
  writeJSON('product-attributes-brand.json', brands);

  // Category furniture attributes
  console.log("  Fetching category furniture terms (attribute ID: 5)...");
  const { data: catFurniture } = await fetchJSON(`${API_BASE_STORE}/products/attributes/${CATEGORY_ATTR_ID}/terms`);
  writeJSON('product-attributes-category.json', catFurniture);
}

async function syncBlogPosts() {
  console.log("\n📝 Syncing Blog Posts...");
  const posts = await fetchAllPages(`${API_BASE_CORE}/posts?_embed`);
  writeJSON('posts.json', posts);
}

async function syncBlogCategories() {
  console.log("\n📂 Syncing Blog Categories...");
  const { data: categories } = await fetchJSON(`${API_BASE_CORE}/categories?per_page=100`);
  writeJSON('blog-categories.json', categories);
}

async function syncHeroSlides() {
  console.log("\n🖼️  Syncing Hero Slides...");
  const { data } = await fetchJSON(`${API_BASE_CORE}/hero-slides?_embed`);
  writeJSON('hero-slides.json', data);
}

async function syncHomeCategories() {
  console.log("\n🏠 Syncing Home Categories...");
  const { data } = await fetchJSON(`${API_BASE_CORE}/home-categories?_embed`);
  writeJSON('home-categories.json', data);
}

async function syncHomeVideo() {
  console.log("\n🎥 Syncing Home Video...");
  const { data } = await fetchJSON(`${API_BASE_CORE}/home-video?_embed`);
  writeJSON('home-video.json', data);
}

async function syncCustomers() {
  console.log("\n👥 Syncing Customers...");
  const { data } = await fetchJSON(`${API_BASE_CORE}/our-customers?_embed`);
  writeJSON('customers.json', data);
}

async function syncPartnersSlider() {
  console.log("\n🔄 Syncing Partners Slider...");
  const { data } = await fetchJSON(`${API_BASE_CORE}/partners-slider?_embed`);
  writeJSON('partners-slider.json', data);
}

async function syncPartners() {
  console.log("\n🤝 Syncing Partners...");
  const { data } = await fetchJSON(`${API_BASE_CORE}/our-partners?_embed`);
  writeJSON('partners.json', data);
}

async function syncProjects() {
  console.log("\n🏗️  Syncing Projects...");
  const projects = await fetchAllPages(`${API_BASE_CORE}/projects?_embed`);
  writeJSON('projects.json', projects);
}

async function syncCatalogues() {
  console.log("\n📚 Syncing Catalogues...");
  const { data } = await fetchJSON(`${API_BASE_CORE}/catalogues?_embed`);
  writeJSON('catalogues.json', data);
}

// ─── Main ──────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  Innovo Static Data Sync");
  console.log("═══════════════════════════════════════════");
  console.log(`  Output: ${OUTPUT_DIR}`);

  ensureDir(OUTPUT_DIR);

  const startTime = Date.now();

  try {
    // Run in parallel where possible, but products first since it's the heaviest
    await syncProducts();
    
    // These can all run in parallel
    await Promise.all([
      syncProductFilters(),
      syncBlogPosts(),
      syncBlogCategories(),
      syncHeroSlides(),
      syncHomeCategories(),
      syncHomeVideo(),
      syncCustomers(),
      syncPartnersSlider(),
      syncPartners(),
      syncProjects(),
      syncCatalogues(),
    ]);

    // Write sync metadata
    const meta = {
      lastSync: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    };
    writeJSON('sync-meta.json', meta);

    console.log("\n═══════════════════════════════════════════");
    console.log(`  ✅ Sync complete in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
    console.log("═══════════════════════════════════════════\n");
  } catch (error) {
    console.error("\n❌ Sync failed:", error);
    process.exit(1);
  }
}

main();
