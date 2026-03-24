import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, Mail, Loader2, Download, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchProductBySlug, fetchProducts, Product, BRAND_ATTR_ID, getOriginalImage, decodeHtmlEntities } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import LazyImage from "@/components/ui/LazyImage";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImage, setSelectedImage] = useState(0);

  // Scroll to top and reset image index when slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
  }, [slug]);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug || ""),
    enabled: !!slug,
  });

  const { data: relatedData } = useQuery({
    queryKey: ["related-products", product?.categories?.[0]?.id],
    queryFn: () => fetchProducts({ 
      category: product!.categories[0].id,
      per_page: 5
    }),
    enabled: !!product?.categories?.[0]?.id,
  });

  const relatedProducts = (relatedData?.data || [])
    .filter((p: Product) => p.id !== product?.id)
    .map((p: Product) => {
      // Ensure we have a slug
      if (!p.slug && p.permalink) {
        p.slug = p.permalink.split('/').filter(Boolean).pop() || "";
      }
      return p;
    })
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container py-4">
          <div className="h-4 w-64 bg-black/5 animate-pulse rounded" />
        </div>
        <main className="container pb-16 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Gallery Skeleton */}
            <div className="space-y-4">
              <div className="aspect-square bg-black/5 animate-pulse rounded-sm" />
              <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-black/5 animate-pulse rounded-sm" />
                ))}
              </div>
            </div>
            {/* Info Skeleton */}
            <div className="space-y-6 pt-2">
              <div className="h-4 w-24 bg-black/5 animate-pulse rounded" />
              <div className="h-10 w-full bg-black/5 animate-pulse rounded" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-black/5 animate-pulse rounded" />
                <div className="h-4 w-full bg-black/5 animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-black/5 animate-pulse rounded" />
              </div>
              <div className="h-24 w-full bg-black/5 animate-pulse rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center text-center p-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">The product you are looking for might have been moved or deleted.</p>
            <Link 
              to="/products" 
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors font-medium"
            >
              Back to Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Breadcrumb + Nav */}
      <section className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/products" className="hover:text-foreground transition-colors">
              Products
            </Link>
            {product.categories?.[0] && (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link 
                  to={`/products?category=${product.categories[0].id}`} 
                  className="hover:text-foreground transition-colors"
                >
                  {decodeHtmlEntities(product.categories[0].name)}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{decodeHtmlEntities(product.name)}</span>
          </div>
        </div>
      </section>

      {/* Product Content */}
      <section className="container pb-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square bg-white border border-gray-100 rounded-sm overflow-hidden group/gallery">
              {/* Product Image with Subtle Zoom */}
              <div 
                className="w-full h-full cursor-default overflow-hidden flex items-center justify-center p-8 group/zoom"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  e.currentTarget.style.setProperty('--x', `${x}%`);
                  e.currentTarget.style.setProperty('--y', `${y}%`);
                }}
              >
                <LazyImage
                  key={product.images[selectedImage]?.src}
                  src={getOriginalImage(product.images[selectedImage]?.src)}
                  alt={decodeHtmlEntities(product.images[selectedImage]?.alt || product.name)}
                  className="max-w-full max-h-full object-contain origin-[var(--x,center)_var(--y,center)] group-hover/zoom:scale-[1.5] transition-transform duration-300"
                  containerClassName="w-full h-full flex items-center justify-center"
                />
              </div>

              {/* Simple Slider Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#CD2727] transition-all opacity-0 group-hover/gallery:opacity-100 z-20"
                  >
                    <ChevronLeft className="w-8 h-8 stroke-[1.5px]" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#CD2727] transition-all opacity-0 group-hover/gallery:opacity-100 z-20"
                  >
                    <ChevronRight className="w-8 h-8 stroke-[1.5px]" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-sm overflow-hidden border-2 transition-all ${
                      i === selectedImage ? "border-[#CD2727] scale-95" : "border-gray-100 hover:border-[#CD2727]/50"
                    }`}
                  >
                    <LazyImage 
                      src={getOriginalImage(img.src)} 
                      alt="" 
                      className="w-full h-full object-contain p-1" 
                      containerClassName="w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="pt-2">
            {/* Brand display */}
            {product.attributes?.find(attr => attr.id === BRAND_ATTR_ID || attr.name.toLowerCase() === "brand")?.terms[0] && (
              <div className="mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-primary drop-shadow-sm">
                   {product.attributes.find(attr => attr.id === BRAND_ATTR_ID || attr.name.toLowerCase() === "brand")?.terms[0].name}
                </span>
              </div>
            )}

            <h1 className="font-heading text-3xl font-bold text-foreground mb-6" dangerouslySetInnerHTML={{ __html: product.name }} />
            
            <div 
              className="text-muted-foreground leading-relaxed mb-8 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* Downloads Section */}
            {product.downloads && product.downloads.length > 0 && (
              <div className="mb-8 p-6 bg-secondary/20 rounded-sm">
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider mb-4 border-b border-border pb-2 flex items-center gap-2">
                  <Download className="w-4 h-4" /> Technical Resources
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.downloads.map((download, idx) => (
                    <a 
                      key={idx}
                      href={download.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-background border border-border hover:border-primary hover:text-primary transition-all rounded-sm group"
                    >
                      <span className="text-sm font-medium">{download.label}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-border pt-6 space-y-3">
              {product.categories && product.categories.length > 0 && (
                <div className="text-sm">
                  <span className="font-bold text-foreground">Categories: </span>
                  <span className="text-muted-foreground">
                    {product.categories.map((cat, i) => (
                      <span key={cat.id}>
                        <Link to={`/products?type=${cat.id}`} className="hover:text-primary transition-colors">
                          {decodeHtmlEntities(cat.name)}
                        </Link>
                        {i < product.categories.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </span>
                </div>
              )}

              {product.tags && product.tags.length > 0 && (
                <div className="text-sm">
                  <span className="font-bold text-foreground">Tags: </span>
                  <span className="text-muted-foreground">
                    {product.tags.map((tag, i) => (
                      <span key={tag.id}>
                        <Link to={`/products?tag=${tag.id}`} className="hover:text-primary transition-colors">
                          {decodeHtmlEntities(tag.name)}
                        </Link>
                        {i < product.tags.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </span>
                </div>
              )}

              {product.attributes?.find(attr => attr.id === BRAND_ATTR_ID || attr.name.toLowerCase() === "brand")?.terms[0] && (
                <div className="text-sm">
                  <span className="font-bold text-foreground">Brand: </span>
                  <Link 
                    to={`/products?brand=${product.attributes.find(attr => attr.id === BRAND_ATTR_ID || attr.name.toLowerCase() === "brand")?.terms[0].id}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {product.attributes.find(attr => attr.id === BRAND_ATTR_ID || attr.name.toLowerCase() === "brand")?.terms[0].name}
                  </Link>
                </div>
              )}

              <div className="text-sm flex items-center gap-3 pt-2">
                <span className="font-bold text-foreground font-heading uppercase tracking-widest text-[10px]">Share:</span>
                <div className="flex items-center gap-3">
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button className="text-muted-foreground hover:text-foreground transition-colors text-xs font-bold">
                    f
                  </button>
                  <button className="text-muted-foreground hover:text-foreground transition-colors text-xs font-bold font-serif">
                    𝕏
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="font-heading text-xl font-semibold text-foreground mb-8 text-center uppercase tracking-widest">
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  name={p.name}
                  brand={p.attributes?.find(attr => attr.id === BRAND_ATTR_ID || attr.name.toLowerCase() === "brand")?.terms[0]?.name}
                  image={getOriginalImage(p.images[0]?.src)}
                  slug={p.slug}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetail;
