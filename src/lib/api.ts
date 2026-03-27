const API_BASE_CORE = "https://innovo-eg.com/wp-json/wp/v2";
const API_BASE_STORE = "https://innovo-eg.com/wp-json/wc/store";

export const BRAND_ATTR_ID = 1;

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

export async function fetchProjects(page = 1, perPage = 9) {
  const response = await fetch(`${API_BASE_CORE}/projects?_embed&page=${page}&per_page=${perPage}`);
  const data = await response.json();
  const total = parseInt(response.headers.get("X-WP-Total") || "0", 10);
  const totalPages = parseInt(response.headers.get("X-WP-TotalPages") || "0", 10);
  return { data, total, totalPages };
}

export async function fetchProjectBySlug(slug: string) {
  const response = await fetch(`${API_BASE_CORE}/projects?slug=${slug}&_embed`);
  const data = await response.json();
  return data.length > 0 ? data[0] : null;
}

export async function fetchProducts(params: Record<string, string | number | string[]> = {}) {
  const queryParts: string[] = [];
  
  for (const key in params) {
    const value = params[key];
    if (Array.isArray(value)) {
      // For category and term_id, WooCommerce Store API often expects comma-separated strings
      if (key === 'category' || key.includes('term_id')) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.join(','))}`);
      } else {
        const arrayKey = key.includes('[') ? key : `${key}[]`;
        value.forEach(v => {
          queryParts.push(`${encodeURIComponent(arrayKey)}=${encodeURIComponent(v)}`);
        });
      }
    } else if (value !== undefined && value !== null && value !== "") {
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  
  const query = queryParts.join('&');
  const response = await fetch(`${API_BASE_STORE}/products?${query}`);
  const data = await response.json();
  const total = parseInt(response.headers.get("X-WP-Total") || "0", 10);
  const totalPages = parseInt(response.headers.get("X-WP-TotalPages") || "0", 10);
  return { data, total, totalPages };
}

export async function fetchCollectionData(params: Record<string, string | number | string[]> = {}) {
  const queryParts: string[] = [];
  
  // Base collection data params - calculating everything by default unless overridden
  const baseParams: Record<string, string | string[]> = {
    "calculate_taxonomy_counts[0][taxonomy]": "product_cat",
    "calculate_attribute_counts[0][taxonomy]": "pa_brand",
    "calculate_attribute_counts[1][taxonomy]": "pa_category_furniture",
  };

  const allParams = { ...baseParams, ...params };

  for (const key in allParams) {
    const value = allParams[key];
    if (Array.isArray(value)) {
      if (key === 'category' || key.includes('term_id')) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.join(','))}`);
      } else {
        const arrayKey = key.includes('[') ? key : `${key}[]`;
        value.forEach(v => {
          queryParts.push(`${encodeURIComponent(arrayKey)}=${encodeURIComponent(v)}`);
        });
      }
    } else if (value !== undefined && value !== null && value !== "") {
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }

  const query = queryParts.join('&');
  const response = await fetch(`${API_BASE_STORE}/products/collection-data?${query}`);
  return await response.json();
}

export function decodeHtmlEntities(text: unknown): string {
  if (typeof text !== 'string') return "";
  const entities: Record<string, string> = {
    '&#8211;': '–',
    '&#8212;': '—',
    '&#8216;': '‘',
    '&#8217;': '’',
    '&#8220;': '“',
    '&#8221;': '”',
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
    // Remove WPBakery/Visual Composer shortcodes
    .replace(/\[\/?vc_[^\]]*\]/g, "")
    // Remove Other common shortcodes
    .replace(/\[\/?et_[^\]]*\]/g, "")
    .replace(/\[\/?rev_slider[^\]]*\]/g, "")
    // Clean up empty paragraphs often left by shortcode removal
    .replace(/<p>\s*<\/p>/g, "")
    // Optional: Trim whitespace
    .trim();
}

export async function fetchProductBySlug(slug: string) {
  if (!slug || slug === "undefined") return null;
  
  console.log("Searching for product by slug:", slug);

  try {
    // 1. Use the Core API to find the product ID by slug (Works even with thousands of products)
    // We try both 'product' and 'products' as the endpoint depends on WP configuration
    let productId: number | null = null;
    
    try {
      const coreSearchResponse = await fetch(`${API_BASE_CORE}/product?slug=${slug}`);
      const coreSearchData = await coreSearchResponse.json();
      if (Array.isArray(coreSearchData) && coreSearchData.length > 0) {
        productId = coreSearchData[0].id;
      } else {
        // Try plural if singular fails
        const coreSearchPluralResponse = await fetch(`${API_BASE_CORE}/products?slug=${slug}`);
        const coreSearchPluralData = await coreSearchPluralResponse.json();
        if (Array.isArray(coreSearchPluralData) && coreSearchPluralData.length > 0) {
          productId = coreSearchPluralData[0].id;
        }
      }
    } catch (e) {
      console.warn("Core API slug search failed, falling back to Store API list scan", e);
    }

    // 2. Fetch the full Store API data using the ID if found
    if (productId) {
      const idResponse = await fetch(`${API_BASE_STORE}/products/${productId}`);
      if (idResponse.ok) {
        const product = await idResponse.json();
        
        // Fetch extra data
        try {
          const coreResponse = await fetch(`${API_BASE_CORE}/product/${product.id}`);
          if (coreResponse.ok) {
            const coreData = await coreResponse.json();
            product.downloads = coreData.downloads || [];
          }
        } catch (e) {
          console.error("Failed to fetch product downloads:", e);
        }
        
        return product;
      }
    }

    // 3. Last Resort Fallback: Scan the first 100 products (already implemented)
    const response = await fetch(`${API_BASE_STORE}/products?per_page=100`);
    const data = await response.json();
    
    if (Array.isArray(data)) {
      const product = data.find((p: Product) => {
        if (p.slug === slug) return true;
        if (p.permalink) {
          const extractedSlug = p.permalink.split('/').filter(Boolean).pop();
          return extractedSlug === slug;
        }
        return false;
      });

      if (product) return product;
    }

    // Try treating slug as ID if numerical
    if (!isNaN(Number(slug))) {
      const directResponse = await fetch(`${API_BASE_STORE}/products/${slug}`);
      if (directResponse.ok) return await directResponse.json();
    }
    
    return null;
  } catch (error) {
    console.error("Error in fetchProductBySlug:", error);
    return null;
  }
}

export async function fetchProductCategories(params: Record<string, string | number | string[]> = {}): Promise<Term[]> {
  const queryParts: string[] = [];
  
  for (const key in params) {
    const value = params[key];
    if (Array.isArray(value)) {
      if (key === 'category' || key.includes('term_id')) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.join(','))}`);
      } else {
        const arrayKey = key.includes('[') ? key : `${key}[]`;
        value.forEach(v => {
          queryParts.push(`${encodeURIComponent(arrayKey)}=${encodeURIComponent(v)}`);
        });
      }
    } else if (value !== undefined && value !== null && value !== "") {
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }

  const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : "";
  const response = await fetch(`${API_BASE_STORE}/products/categories${query}${query ? '&' : '?'}per_page=100`);
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.filter((cat: Term) => (cat.count || 0) > 0);
}

export async function fetchProductAttributes(attributeId: number) {
  const response = await fetch(`${API_BASE_STORE}/products/attributes/${attributeId}/terms`);
  return await response.json();
}


export function getOriginalImage(url: string | undefined): string {
  if (!url) return "/placeholder.svg";
  return url
    .replace(/-\d+x\d+(?=\.(jpg|jpeg|png|gif|webp))/i, '')
    .replace(/-scaled(?=\.(jpg|jpeg|png|gif|webp))/i, '');
}

export async function fetchPartners() {
  const response = await fetch(`${API_BASE_CORE}/our-partners?_embed`);
  return await response.json();
}

export async function fetchCustomers() {
  const response = await fetch(`${API_BASE_CORE}/our-customers?_embed`);
  return await response.json();
}

export async function fetchPartnersSlider() {
  const response = await fetch(`${API_BASE_CORE}/partners-slider?_embed`);
  return await response.json();
}

export async function fetchHeroSlides() {
  const response = await fetch(`${API_BASE_CORE}/hero-slides?_embed`);
  return await response.json();
}

export async function fetchHomeCategories() {
  const response = await fetch(`${API_BASE_CORE}/home-categories?_embed`);
  return await response.json();
}

export async function fetchHomeVideo() {
  const response = await fetch(`${API_BASE_CORE}/home-video?_embed`);
  return await response.json();
}

export async function fetchCatalogues() {
  const response = await fetch(`${API_BASE_CORE}/catalogues?_embed`);
  return await response.json();
}

export async function fetchCatalogueBySlug(slug: string) {
  const response = await fetch(`${API_BASE_CORE}/catalogues?slug=${slug}&_embed`);
  const data = await response.json();
  return data.length > 0 ? data[0] : null;
}

export async function fetchPosts(page = 1, perPage = 10, category?: number) {
  let url = `${API_BASE_CORE}/posts?_embed&page=${page}&per_page=${perPage}`;
  if (category) url += `&categories=${category}`;
  
  const response = await fetch(url);
  const data = await response.json();
  const total = parseInt(response.headers.get("X-WP-Total") || "0", 10);
  const totalPages = parseInt(response.headers.get("X-WP-TotalPages") || "0", 10);
  return { data, total, totalPages };
}

export async function fetchPostBySlug(slug: string) {
  const response = await fetch(`${API_BASE_CORE}/posts?slug=${slug}&_embed`);
  const data = await response.json();
  return data.length > 0 ? data[0] : null;
}

export async function fetchBlogCategories() {
  const response = await fetch(`${API_BASE_CORE}/categories?per_page=100`);
  return await response.json();
}

export async function fetchAdjacentPosts(date: string) {
  // Newer post (Logically "Previous" in the blog feed)
  const newerUrl = `${API_BASE_CORE}/posts?_embed&per_page=1&after=${date}&orderby=date&order=asc`;
  // Older post (Logically "Next" in the blog feed)
  const olderUrl = `${API_BASE_CORE}/posts?_embed&per_page=1&before=${date}&orderby=date&order=desc`;

  const [newerRes, olderRes] = await Promise.all([
    fetch(newerUrl),
    fetch(olderUrl)
  ]);

  const newerData = await newerRes.json();
  const olderData = await olderRes.json();

  let previous = Array.isArray(newerData) && newerData.length > 0 ? newerData[0] : null;
  let next = Array.isArray(olderData) && olderData.length > 0 ? olderData[0] : null;

  // Circular Wrapping: If we are at the newest, "Previous" wraps to the oldest.
  // If we are at the oldest, "Next" wraps to the newest.
  
  if (!previous) {
    const oldestUrl = `${API_BASE_CORE}/posts?_embed&per_page=1&orderby=date&order=asc`;
    const res = await fetch(oldestUrl);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].id !== previous?.id) {
      previous = data[0].date !== date ? data[0] : null;
    }
  }

  if (!next) {
    const newestUrl = `${API_BASE_CORE}/posts?_embed&per_page=1&orderby=date&order=desc`;
    const res = await fetch(newestUrl);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      next = data[0].date !== date ? data[0] : null;
    }
  }

  return { previous, next };
}

export async function fetchSocialLinks() {
  const response = await fetch(`${API_BASE_CORE}/social-links?_embed&per_page=20`);
  return await response.json();
}
