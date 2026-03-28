/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/* global console, fetch, Headers */

// @ts-expect-error Node.js module
import fs from 'fs';
// @ts-expect-error Node.js module
import path from 'path';
// @ts-expect-error Node.js module
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_CORE = "https://innovo-eg.com/wp-json/wp/v2";
const API_BASE_STORE = "https://innovo-eg.com/wp-json/wc/store";
const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'data');

const BRAND_ATTR_ID = 1;
const CATEGORY_ATTR_ID = 5;

// ─── Interfaces ──────────────────────────────────────────

interface WCTerm {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

interface WCMedia {
  source_url: string;
  alt_text: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<string, { source_url: string }>;
  };
}

interface WPItem {
  id: number;
  date: string;
  slug: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  categories?: number[];
  tags?: number[];
  author: number;
  _embedded?: {
    'wp:featuredmedia'?: WCMedia[];
    'wp:term'?: Array<WCTerm[]>;
    'author'?: Array<{ name: string; avatar_urls?: Record<string, string> }>;
  };
}

interface WCProduct {
  id: number;
  name: string;
  slug: string;
  parent: number;
  type: string;
  variation: string;
  permalink: string;
  sku: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  prices: unknown;
  price_html: string;
  average_rating: string;
  review_count: number;
  images: Array<{ id: number; src: string; name: string; alt: string }>;
  categories: Array<{ id: number; name: string; slug: string; link: string }>;
  tags: Array<{ id: number; name: string; slug: string }>;
  attributes: Array<{ id: number; name: string; taxonomy: string; terms: WCTerm[] }>;
  variations: number[];
  has_options: boolean;
  is_purchasable: boolean;
  is_in_stock: boolean;
  is_on_backorder: boolean;
  low_stock_remaining: number | null;
  sold_individually: boolean;
  add_to_cart: unknown;
  downloads?: Array<{ label: string; url: string }>;
}

interface WPSocialLink {
  id: number;
  slug: string;
  title: { rendered: string };
  link: string;
  social_details?: {
    url: string;
    icon: string;
  };
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

async function fetchJSON(url: string): Promise<{ data: unknown; headers: Headers }> {
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
async function fetchAllPages<T = unknown>(baseUrl: string, perPage = 100): Promise<T[]> {
  const separator = baseUrl.includes('?') ? '&' : '?';
  let page = 1;
  let allItems: T[] = [];
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${baseUrl}${separator}per_page=${perPage}&page=${page}`;
    const { data, headers } = await fetchJSON(url) as { data: T | T[]; headers: Headers };

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

// ─── Mapping Helpers ───────────────────────────────────────

function mapMedia(media: WCMedia | undefined) {
  if (!media) return undefined;
  return {
    source_url: media.source_url,
    alt_text: media.alt_text,
    media_details: {
      width: media.media_details?.width,
      height: media.media_details?.height,
      sizes: media.media_details?.sizes ? Object.fromEntries(
        Object.entries(media.media_details.sizes).filter(([key]) => ['medium', 'full', 'large', 'thumbnail'].includes(key))
      ) : undefined,
    }
  };
}

function mapWPItem(item: WPItem) {
  return {
    id: item.id,
    date: item.date,
    slug: item.slug,
    link: item.link,
    title: item.title,
    excerpt: item.excerpt,
    content: item.content,
    featured_media: item.featured_media,
    categories: item.categories,
    tags: item.tags,
    author: item.author,
    _embedded: {
      'wp:featuredmedia': item._embedded?.['wp:featuredmedia']?.map(mapMedia),
      'wp:term': item._embedded?.['wp:term'],
      'author': item._embedded?.['author']?.map((a) => ({
        name: a.name,
        avatar_urls: a.avatar_urls,
      })),
    }
  };
}

function mapProduct(p: WCProduct) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    parent: p.parent,
    type: p.type,
    variation: p.variation,
    permalink: p.permalink,
    sku: p.sku,
    short_description: p.short_description,
    description: p.description,
    on_sale: p.on_sale,
    prices: p.prices,
    price_html: p.price_html,
    average_rating: p.average_rating,
    review_count: p.review_count,
    images: p.images?.map((img) => ({
      id: img.id,
      src: img.src,
      thumbnail: img.src, // Fallback to src if thumbnail specifically missing in WCProduct
      srcset: '',
      sizes: '',
      name: img.name,
      alt: img.alt,
    })),
    categories: p.categories?.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      link: c.link,
    })),
    tags: p.tags,
    attributes: p.attributes?.map((a) => ({
      id: a.id,
      name: a.name,
      taxonomy: a.taxonomy,
      terms: a.terms?.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
      })),
    })),
    variations: p.variations,
    has_options: p.has_options,
    is_purchasable: p.is_purchasable,
    is_in_stock: p.is_in_stock,
    is_on_backorder: p.is_on_backorder,
    low_stock_remaining: p.low_stock_remaining,
    sold_individually: p.sold_individually,
    add_to_cart: p.add_to_cart,
    downloads: p.downloads,
  };
}

function mapSocialLink(item: WPSocialLink) {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    social_details: {
      url: item.social_details?.url || item.link || "#",
      icon: item.social_details?.icon || item.slug || "minus"
    }
  };
}

// ─── Data Fetchers ─────────────────────────────────────────

async function syncProducts(): Promise<WCProduct[]> {
  console.log("\n📦 Syncing Products...");
  const products = await fetchAllPages<WCProduct>(`${API_BASE_STORE}/products?`);

  // Enrich each product with download links from Core API (parallel batches)
  console.log("    → Fetching download links for each product (parallel batches)...");
  let enrichedDownloads = 0;
  const BATCH_SIZE = 10;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (product) => {
      try {
        const { data: rawData } = await fetchJSON(`${API_BASE_CORE}/product/${product.id}`);
        const coreData = rawData as { downloads?: Array<{ label?: string; name?: string; url?: string; file?: string }> };
        if (coreData?.downloads?.length) {
          product.downloads = coreData.downloads.map((d) => ({
            label: d.label || d.name || 'Download',
            url: d.url || d.file || '',
          }));
          enrichedDownloads++;
        }
      } catch { /* Skip */ }
    }));
    // @ts-expect-error Node.js global
    process.stdout.write(`\r      Progress: ${Math.min(i + BATCH_SIZE, products.length)}/${products.length}`);
  }
  console.log(`\n    → Enriched ${enrichedDownloads} products with download links`);

  // ENRICH WITH MISSING ATTRIBUTES (Brands & Categories)
  // Store API sometimes omits global attributes from the main list.
  // We fetch products per term and inject them back.
  console.log("    → Enriching missing attributes (Brands & Categories)...");

  const enrichAttribute = async (attrId: number, taxonomy: string, name: string) => {
    const { data: terms } = await fetchJSON(`${API_BASE_STORE}/products/attributes/${attrId}/terms`) as { data: WCTerm[] };
    if (!Array.isArray(terms)) return;
    
    for (const term of terms) {
      if (term.count === 0) continue;
      const termProducts = await fetchAllPages<WCProduct>(`${API_BASE_STORE}/products?attributes[0][attribute]=${taxonomy}&attributes[0][term_id]=${term.id}`);
      for (const tp of termProducts) {
        const p = products.find(prod => prod.id === tp.id);
        if (p) {
          if (!p.attributes) p.attributes = [];
          let attr = p.attributes.find((a) => a.id === attrId);
          if (!attr) {
            attr = { id: attrId, name, taxonomy, terms: [] };
            p.attributes.push(attr);
          }
          if (!attr.terms.find((t) => t.id === term.id)) {
            attr.terms.push({ id: term.id, name: term.name, slug: term.slug });
          }
        }
      }
      // @ts-expect-error Node.js global
      process.stdout.write(`\r      Injected ${name} term: ${term.name}`);
    }
    console.log(`\n      ✓ ${name} enrichment complete`);
  };

  await enrichAttribute(BRAND_ATTR_ID, 'pa_brand', 'Brand');
  await enrichAttribute(CATEGORY_ATTR_ID, 'pa_category_furniture', 'Category');

  console.log("    → Mapping products to lean structure...");
  const mappedProducts = products.map(mapProduct);

  writeJSON('products.json', mappedProducts);
  return mappedProducts;
}

async function syncProductFilters() {
  console.log("\n🏷️  Syncing Product Filters...");

  // Categories (WC Store)
  console.log("  Fetching product categories...");
  const { data: categories } = await fetchJSON(`${API_BASE_STORE}/products/categories?per_page=100`) as { data: WCTerm[] };
  writeJSON('product-categories.json', Array.isArray(categories) ? categories.filter((c) => (c.count || 0) > 0) : []);

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
  const posts = await fetchAllPages<WPItem>(`${API_BASE_CORE}/posts?_embed`);
  writeJSON('posts.json', posts.map(mapWPItem));
}

async function syncBlogCategories() {
  console.log("\n📂 Syncing Blog Categories...");
  const { data: categories } = await fetchJSON(`${API_BASE_CORE}/categories?per_page=100`);
  writeJSON('blog-categories.json', categories);
}

async function syncHeroSlides() {
  console.log("\n🖼️  Syncing Hero Slides...");
  const { data } = await fetchJSON(`${API_BASE_CORE}/hero-slides?_embed`);
  writeJSON('hero-slides.json', data as unknown[]);
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
  const projects = await fetchAllPages<WPItem>(`${API_BASE_CORE}/projects?_embed`);
  writeJSON('projects.json', projects.map(mapWPItem));
}

async function syncCatalogues() {
  console.log("\n📚 Syncing Catalogues...");
  const { data } = await fetchJSON(`${API_BASE_CORE}/catalogues?_embed`);
  writeJSON('catalogues.json', (Array.isArray(data) ? data : [data]).map(mapWPItem));
}

async function syncSocialLinks() {
  console.log("\n📱 Syncing Social Links...");
  try {
    const { data } = await fetchJSON(`${API_BASE_CORE}/social-links?_embed&per_page=20`);
    const links = Array.isArray(data) ? data : [];
    writeJSON('social-links.json', links.map(mapSocialLink as any));
  } catch (error) {
    console.error("  ❌ Social Links API failed:", (error as Error).message);
    throw error; // Re-throw to be handled by parallel task runner
  }
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
    // 1. Sync Products first (critical and heaviest)
    try {
      await syncProducts();
    } catch (e) {
      console.error("  ❌ Critical failure syncing products:", e);
    }
    
    // 2. Sync all other data in parallel with individual error boundaries
    const tasks = [
      { name: "Product Filters", fn: syncProductFilters },
      { name: "Blog Posts", fn: syncBlogPosts },
      { name: "Blog Categories", fn: syncBlogCategories },
      { name: "Hero Slides", fn: syncHeroSlides },
      { name: "Home Categories", fn: syncHomeCategories },
      { name: "Home Video", fn: syncHomeVideo },
      { name: "Customers", fn: syncCustomers },
      { name: "Partners Slider", fn: syncPartnersSlider },
      { name: "Partners", fn: syncPartners },
      { name: "Projects", fn: syncProjects },
      { name: "Catalogues", fn: syncCatalogues },
      { name: "Social Links", fn: syncSocialLinks },
    ];

    console.log("\n📦 Syncing metadata in parallel...");
    const results = await Promise.allSettled(tasks.map(async (task) => {
      try {
        await task.fn();
        return { name: task.name, success: true };
      } catch (e) {
        console.error(`  ❌ Failed to sync ${task.name}:`, e);
        return { name: task.name, success: false, error: e };
      }
    }));

    const failed = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
    if (failed.length > 0) {
      console.log(`\n  ⚠️  Sync finished with ${failed.length} failures.`);
    }

    // Write sync metadata
    const meta = {
      lastSync: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      failures: failed.map((f) => (f.status === 'fulfilled' ? f.value.name : "Unknown")),
    };
    writeJSON('sync-meta.json', meta);

    console.log("\n═══════════════════════════════════════════");
    console.log(`  ✅ Sync process finished in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
    console.log("═══════════════════════════════════════════\n");
  } catch (error) {
    console.error("\n❌ Global sync failure:", error);
    // @ts-expect-error Node.js global
    process.exit(1);
  }
}

main();
