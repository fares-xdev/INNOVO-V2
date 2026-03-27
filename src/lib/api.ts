const API_BASE_CORE = "https://innovo-eg.com/wp-json/wp/v2";
const API_BASE_STORE = "https://innovo-eg.com/wp-json/wc/store";

export const BRAND_ATTR_ID = 1;
const CATEGORY_ATTR_ID = 5;

export interface WordPressProject {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  slug: string;
  _embedded?: {
    "wp:featuredmedia"?: Array<{ 
      source_url: string;
      media_details?: {
        sizes?: Record<string, { source_url: string }>;
      };
    }>;
  };
}

export interface Term {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  parent?: number;
  image?: { src: string };
}

export interface ProductImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price_html: string;
  images: ProductImage[];
  categories: Array<{ id: number; name: string; slug: string }>;
  attributes: Array<{ id: number; name: string; terms: Term[] }>;
  downloads?: Array<{ label: string; url: string }>;
  tags?: Array<{ id: number; name: string; slug: string }>;
  permalink?: string;
}

export interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  date: string;
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    "wp:featuredmedia"?: Array<{ 
      source_url: string;
      alt_text: string;
    }>;
    "author"?: Array<{
      name: string;
      avatar_urls?: Record<string, string>;
    }>;
    "wp:term"?: Array<Array<{
      id: number;
      name: string;
      slug: string;
      taxonomy: string;
    }>>;
  };
}

// ─── Static Data Cache ─────────────────────────────────────
// In-memory cache to avoid re-fetching JSON files on every call

const dataCache: Record<string, unknown> = {};

async function loadStaticData<T>(filename: string): Promise<T | null> {
  // Check memory cache first
  if (dataCache[filename]) {
    return dataCache[filename] as T;
  }

  try {
    const response = await fetch(`/data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`);
    }
    const data = await response.json();
    dataCache[filename] = data;
    return data as T;
  } catch (error) {
    console.error(`API Error: Could not load static data [${filename}]`, error);
    // Return empty list as fallback for common collection files to prevent UI crashes
    if (filename.endsWith('.json') && 
       (filename.includes('products') || filename.includes('posts') || 
        filename.includes('projects') || filename.includes('catalogues'))) {
      return [] as unknown as T;
    }
    return null;
  }
}

// ─── Products ──────────────────────────────────────────────

export async function fetchProducts(params: Record<string, string | number | string[]> = {}) {
  const allProducts = await loadStaticData<Product[]>('products.json');
  
  let filtered = [...allProducts];
  
  // Search filter
  const search = params.search as string;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.short_description?.toLowerCase().includes(q) ||
      p.categories?.some(c => c.name.toLowerCase().includes(q)) ||
      p.attributes?.some(a => a.terms?.some(t => t.name.toLowerCase().includes(q)))
    );
  }
  
  // Category filter (product_cat IDs, comma-separated)
  const categoryParam = params.category;
  if (categoryParam) {
    const catIds = String(categoryParam).split(',').map(Number).filter(Boolean);
    if (catIds.length > 0) {
      filtered = filtered.filter(p => 
        p.categories?.some(c => catIds.includes(c.id))
      );
    }
  }
  
  // Attribute filters (pa_brand, pa_category_furniture, etc.)
  // Parse attribute params like: attributes[0][attribute]=pa_brand, attributes[0][term_id]=5
  const attrFilters: Record<string, number[]> = {};
  for (const key in params) {
    const attrMatch = key.match(/^attributes\[(\d+)\]\[attribute\]$/);
    if (attrMatch) {
      const idx = attrMatch[1];
      const taxonomy = String(params[key]);
      const termIdKey = `attributes[${idx}][term_id]`;
      const termId = Number(params[termIdKey]);
      if (taxonomy && termId) {
        if (!attrFilters[taxonomy]) attrFilters[taxonomy] = [];
        attrFilters[taxonomy].push(termId);
      }
    }
  }
  
  // Apply attribute filters
  for (const [taxonomy, termIds] of Object.entries(attrFilters)) {
    // Map taxonomy to attribute name for matching
    const attrName = taxonomy.replace('pa_', '');
    filtered = filtered.filter(p => 
      p.attributes?.some(a => {
        const nameMatch = a.name.toLowerCase() === attrName || 
                         a.name.toLowerCase().replace(/[\s_-]/g, '') === attrName.replace(/[\s_-]/g, '');
        // Also check by attribute ID for pa_brand (1) and pa_category_furniture (5)
        const idMatch = (taxonomy === 'pa_brand' && a.id === BRAND_ATTR_ID) ||
                       (taxonomy === 'pa_category_furniture' && a.id === CATEGORY_ATTR_ID);
        return (nameMatch || idMatch) && a.terms?.some(t => termIds.includes(t.id));
      })
    );
  }
  
  // Pagination
  const page = Number(params.page) || 1;
  const perPage = Number(params.per_page) || 12;
  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const data = filtered.slice(start, start + perPage);
  
  return { data, total, totalPages };
}

export async function fetchCollectionData(params: Record<string, string | number | string[]> = {}) {
  // Collection data is now computed client-side from the full product list.
  // This function computes attribute/taxonomy counts for the faceted filtering sidebar.
  const allProducts = await loadStaticData<Product[]>('products.json');
  
  let filtered = [...allProducts];
  
  // Apply the same filters as fetchProducts (search, category, attributes)
  // but EXCLUDE the taxonomy we're counting (this is how faceted filtering works)
  const search = params.search as string;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.short_description?.toLowerCase().includes(q) ||
      p.categories?.some(c => c.name.toLowerCase().includes(q)) ||
      p.attributes?.some(a => a.terms?.some(t => t.name.toLowerCase().includes(q)))
    );
  }
  
  const categoryParam = params.category;
  if (categoryParam) {
    const catIds = String(categoryParam).split(',').map(Number).filter(Boolean);
    if (catIds.length > 0) {
      filtered = filtered.filter(p => 
        p.categories?.some(c => catIds.includes(c.id))
      );
    }
  }
  
  // Apply attribute filters
  const attrFilters: Record<string, number[]> = {};
  for (const key in params) {
    const attrMatch = key.match(/^attributes\[(\d+)\]\[attribute\]$/);
    if (attrMatch) {
      const idx = attrMatch[1];
      const taxonomy = String(params[key]);
      const termIdKey = `attributes[${idx}][term_id]`;
      const termId = Number(params[termIdKey]);
      if (taxonomy && termId) {
        if (!attrFilters[taxonomy]) attrFilters[taxonomy] = [];
        attrFilters[taxonomy].push(termId);
      }
    }
  }
  
  for (const [taxonomy, termIds] of Object.entries(attrFilters)) {
    const attrName = taxonomy.replace('pa_', '');
    filtered = filtered.filter(p => 
      p.attributes?.some(a => {
        const nameMatch = a.name.toLowerCase() === attrName || 
                         a.name.toLowerCase().replace(/[\s_-]/g, '') === attrName.replace(/[\s_-]/g, '');
        const idMatch = (taxonomy === 'pa_brand' && a.id === BRAND_ATTR_ID) ||
                       (taxonomy === 'pa_category_furniture' && a.id === CATEGORY_ATTR_ID);
        return (nameMatch || idMatch) && a.terms?.some(t => termIds.includes(t.id));
      })
    );
  }
  
  // Now compute counts for the requested taxonomy
  const attributeCounts: Array<{ term: number; count: number }> = [];
  
  // Check what taxonomy counts are being requested
  for (const key in params) {
    if (key.includes('calculate_attribute_counts') && key.includes('[taxonomy]')) {
      const taxonomy = String(params[key]);
      
      if (taxonomy === 'product_cat') {
        // Count products per category
        const countMap: Record<number, number> = {};
        for (const p of filtered) {
          for (const cat of (p.categories || [])) {
            countMap[cat.id] = (countMap[cat.id] || 0) + 1;
          }
        }
        for (const [id, count] of Object.entries(countMap)) {
          attributeCounts.push({ term: Number(id), count });
        }
      } else {
        // Count products per attribute term (pa_brand, pa_category_furniture, etc.)
        const attrName = taxonomy.replace('pa_', '');
        const countMap: Record<number, number> = {};
        for (const p of filtered) {
          for (const attr of (p.attributes || [])) {
            const nameMatch = attr.name.toLowerCase() === attrName ||
                             attr.name.toLowerCase().replace(/[\s_-]/g, '') === attrName.replace(/[\s_-]/g, '');
            const idMatch = (taxonomy === 'pa_brand' && attr.id === BRAND_ATTR_ID) ||
                           (taxonomy === 'pa_category_furniture' && attr.id === CATEGORY_ATTR_ID);
            if (nameMatch || idMatch) {
              for (const term of (attr.terms || [])) {
                countMap[term.id] = (countMap[term.id] || 0) + 1;
              }
            }
          }
        }
        for (const [id, count] of Object.entries(countMap)) {
          attributeCounts.push({ term: Number(id), count });
        }
      }
    }
    
    if (key.includes('calculate_taxonomy_counts') && key.includes('[taxonomy]')) {
      const taxonomy = String(params[key]);
      if (taxonomy === 'product_cat') {
        const countMap: Record<number, number> = {};
        for (const p of filtered) {
          for (const cat of (p.categories || [])) {
            countMap[cat.id] = (countMap[cat.id] || 0) + 1;
          }
        }
        for (const [id, count] of Object.entries(countMap)) {
          attributeCounts.push({ term: Number(id), count });
        }
      }
    }
  }
  
  return { attribute_counts: attributeCounts };
}

export async function fetchProductBySlug(slug: string) {
  if (!slug || slug === "undefined") return null;
  
  const products = await loadStaticData<Product[]>('products.json');
  
  // Find by slug
  let product = products.find(p => p.slug === slug);
  
  // Try by permalink extraction
  if (!product) {
    product = products.find(p => {
      if (p.permalink) {
        const extractedSlug = p.permalink.split('/').filter(Boolean).pop();
        return extractedSlug === slug;
      }
      return false;
    });
  }
  
  // Try by ID if numerical
  if (!product && !isNaN(Number(slug))) {
    product = products.find(p => p.id === Number(slug));
  }
  
  return product || null;
}

export async function fetchProductCategories(_params: Record<string, string | number | string[]> = {}): Promise<Term[]> {
  const categories = await loadStaticData<Term[]>('product-categories.json');
  return Array.isArray(categories) ? categories.filter(cat => (cat.count || 0) > 0) : [];
}

export async function fetchProductAttributes(attributeId: number) {
  if (attributeId === BRAND_ATTR_ID) {
    return await loadStaticData('product-attributes-brand.json');
  }
  if (attributeId === CATEGORY_ATTR_ID) {
    return await loadStaticData('product-attributes-category.json');
  }
  // Fallback for unknown attribute IDs — shouldn't happen with current usage
  const response = await fetch(`${API_BASE_STORE}/products/attributes/${attributeId}/terms`);
  return await response.json();
}

// ─── Utility Functions ─────────────────────────────────────

export function decodeHtmlEntities(text: unknown): string {
  if (typeof text !== 'string') return "";
  const entities: Record<string, string> = {
    '&#8211;': '–',
    '&#8212;': '—',
    '&#8216;': '\u2018',
    '&#8217;': '\u2019',
    '&#8220;': '\u201C',
    '&#8221;': '\u201D',
    '&#8230;': '…',
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#039;': "'",
    '&laquo;': '«',
    '&raquo;': '»',
    '&copy;': '©',
    '&reg;': '®',
  };
  return text.replace(/&#\d+;|&[a-z]+;/gi, (match) => entities[match] || match);
}

export function cleanWordPressContent(html: string): string {
  if (!html) return "";
  
  return html
    .replace(/\[\/?vc_[^\]]*\]/g, "")
    .replace(/\[\/?et_[^\]]*\]/g, "")
    .replace(/\[\/?rev_slider[^\]]*\]/g, "")
    .replace(/<p>\s*<\/p>/g, "")
    .trim();
}

export function getOriginalImage(url: string | undefined): string {
  if (!url) return "/placeholder.svg";
  return url
    .replace(/-\d+x\d+(?=\.(jpg|jpeg|png|gif|webp))/i, '')
    .replace(/-scaled(?=\.(jpg|jpeg|png|gif|webp))/i, '');
}

// ─── Partners & Homepage ───────────────────────────────────

export async function fetchPartners() {
  return await loadStaticData('partners.json');
}

export async function fetchCustomers() {
  return await loadStaticData('customers.json');
}

export async function fetchPartnersSlider() {
  return await loadStaticData('partners-slider.json');
}

export async function fetchHeroSlides() {
  return await loadStaticData('hero-slides.json');
}

export async function fetchHomeCategories() {
  return await loadStaticData('home-categories.json');
}

export async function fetchHomeVideo() {
  return await loadStaticData('home-video.json');
}

// ─── Catalogues ────────────────────────────────────────────

export async function fetchCatalogues() {
  return await loadStaticData('catalogues.json');
}

export async function fetchCatalogueBySlug(slug: string) {
  const catalogues = await loadStaticData<Array<{ slug: string }>>('catalogues.json');
  if (!Array.isArray(catalogues)) return null;
  return catalogues.find(c => c.slug === slug) || null;
}

// ─── Blog ──────────────────────────────────────────────────

export async function fetchPosts(page = 1, perPage = 10, category?: number) {
  const allPosts = await loadStaticData<WordPressPost[]>('posts.json');
  
  // Sort by date descending (newest first)
  let filtered = [...allPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Filter by category if provided
  if (category) {
    filtered = filtered.filter(p => p.categories?.includes(category));
  }
  
  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const data = filtered.slice(start, start + perPage);
  
  return { data, total, totalPages };
}

export async function fetchPostBySlug(slug: string) {
  if (!slug) return null;
  const posts = await loadStaticData<WordPressPost[]>('posts.json');
  if (!Array.isArray(posts)) return null;
  return posts.find(p => p.slug === slug) || null;
}

export async function fetchBlogCategories() {
  return await loadStaticData('blog-categories.json');
}

export async function fetchAdjacentPosts(date: string) {
  const allPosts = await loadStaticData<WordPressPost[]>('posts.json');
  
  // Sort by date descending
  const sorted = [...allPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const currentIndex = sorted.findIndex(p => p.date === date);
  
  if (currentIndex === -1) return { previous: null, next: null };
  
  // In the sorted array (newest first):
  // "Previous" = newer post = index - 1
  // "Next" = older post = index + 1
  let previous = currentIndex > 0 ? sorted[currentIndex - 1] : null;
  let next = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;
  
  // Circular wrapping
  if (!previous && sorted.length > 1) {
    previous = sorted[sorted.length - 1]; // oldest post
  }
  if (!next && sorted.length > 1) {
    next = sorted[0]; // newest post
  }
  
  // Prevent linking to self
  if (previous?.date === date) previous = null;
  if (next?.date === date) next = null;
  
  return { previous, next };
}

// ─── Projects ──────────────────────────────────────────────

export async function fetchProjects(page = 1, perPage = 9) {
  const allProjects = await loadStaticData<WordPressProject[]>('projects.json');
  
  const total = allProjects.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const data = allProjects.slice(start, start + perPage);
  
  return { data, total, totalPages };
}

export async function fetchProjectBySlug(slug: string) {
  if (!slug) return null;
  const projects = await loadStaticData<WordPressProject[]>('projects.json');
  if (!Array.isArray(projects)) return null;
  return projects.find(p => p.slug === slug) || null;
}
