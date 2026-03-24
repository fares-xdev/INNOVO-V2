import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Menu, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchCollectionData, fetchProductCategories, fetchProductAttributes, Product, Term, getOriginalImage, decodeHtmlEntities } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const DEFAULT_ITEMS_PER_PAGE = 12;
const BRAND_ATTR_ID = 1;
const CATEGORY_ATTR_ID = 5;

const getPaginationItems = (current: number, total: number) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gridCols, setGridCols] = useState<number>(4);
  const [itemsPerPage, setItemsPerPage] = useState<number>(16);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const activeTypeSlugs = searchParams.get("filter_type")?.split(",").filter(Boolean) || [];
  const activeBrandSlugs = searchParams.get("filter_brand")?.split(",").filter(Boolean) || [];
  const activeCatSlugs = searchParams.get("filter_cat")?.split(",").filter(Boolean) || [];
  const searchQuery = searchParams.get("search");

  // Fetch Filters
  const { data: filters } = useQuery({
    queryKey: ["product-filters"],
    queryFn: async () => {
      const [types, brands, categories] = await Promise.all([
        fetchProductCategories(),
        fetchProductAttributes(BRAND_ATTR_ID),
        fetchProductAttributes(CATEGORY_ATTR_ID)
      ]);
      return { types, brands, categories };
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const types = filters?.types || [];
  const brands = filters?.brands || [];
  const categories = filters?.categories || [];

  // Hierarchical categories for sidebar
  const hierarchicalTypes = (() => {
    if (!filters?.types) return [];
    const allTypes = filters.types;
    const parents = allTypes.filter((t: Term) => !t.parent || t.parent === 0);
    return parents.map((parent: Term) => ({
      ...parent,
      children: allTypes.filter((child: Term) => child.parent === parent.id)
    }));
  })();

  const [expandedTypes, setExpandedTypes] = useState<number[]>([]);

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering the filter toggle
    setExpandedTypes(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Define IDs explicitly before queries for clarity and reliability
  const activeTypeIds = types.filter(t => activeTypeSlugs.includes(t.slug)).map(t => t.id);
  const activeBrandIds = brands.filter(b => activeBrandSlugs.includes(b.slug)).map(b => b.id);
  const activeCatIds = categories.filter(c => activeCatSlugs.includes(c.slug)).map(c => c.id);

  // 1. BRAND COUNTS (Exclude Brand filter, Include Type + Category)
  const brandCountsQuery = useQuery({
    queryKey: ["brand-counts", activeTypeSlugs.join(","), activeCatSlugs.join(","), searchQuery],
    enabled: !!filters,
    queryFn: () => {
      const params: Record<string, string | number | string[]> = {
        "calculate_attribute_counts[0][taxonomy]": "pa_brand",
      };
      if (searchQuery) params.search = searchQuery;
      if (activeTypeIds.length > 0) params.category = activeTypeIds.join(",");
      
      let attrIndex = 0;
      activeCatIds.forEach(id => {
        params[`attributes[${attrIndex}][attribute]`] = "pa_category_furniture";
        params[`attributes[${attrIndex}][term_id]`] = id;
        attrIndex++;
      });
      return fetchCollectionData(params);
    },
    staleTime: 1000 * 30,
  });

  // 2. CATEGORY COUNTS (Exclude Category filter, Include Brand + Type)
  const categoryCountsQuery = useQuery({
    queryKey: ["category-counts", activeBrandSlugs.join(","), activeTypeSlugs.join(","), searchQuery],
    enabled: !!filters,
    queryFn: () => {
      const params: Record<string, string | number | string[]> = {
        "calculate_attribute_counts[0][taxonomy]": "pa_category_furniture",
      };
      if (searchQuery) params.search = searchQuery;
      if (activeTypeIds.length > 0) params.category = activeTypeIds.join(",");
      
      let attrIndex = 0;
      activeBrandIds.forEach(id => {
        params[`attributes[${attrIndex}][attribute]`] = "pa_brand";
        params[`attributes[${attrIndex}][term_id]`] = id;
        attrIndex++;
      });
      return fetchCollectionData(params);
    },
    staleTime: 1000 * 30,
  });

  // 3. TYPE COUNTS (Exclude Type filter, Include Brand + Category)
  const typeCountsQuery = useQuery({
    queryKey: ["type-counts", activeBrandSlugs.join(","), activeCatSlugs.join(","), searchQuery],
    enabled: !!filters,
    queryFn: () => {
      const params: Record<string, string | number | string[]> = {
        "calculate_attribute_counts[0][taxonomy]": "product_cat",
      };
      if (searchQuery) params.search = searchQuery;
      
      let attrIndex = 0;
      activeBrandIds.forEach(id => {
        params[`attributes[${attrIndex}][attribute]`] = "pa_brand";
        params[`attributes[${attrIndex}][term_id]`] = id;
        attrIndex++;
      });
      activeCatIds.forEach(id => {
        params[`attributes[${attrIndex}][attribute]`] = "pa_category_furniture";
        params[`attributes[${attrIndex}][term_id]`] = id;
        attrIndex++;
      });
      return fetchCollectionData(params);
    },
    staleTime: 1000 * 30,
  });

  // Debugging logs
  useEffect(() => {
    if (brandCountsQuery.data) console.log("BRAND COUNTS DATA RECEIVED:", brandCountsQuery.data);
    if (categoryCountsQuery.data) console.log("CAT COUNTS DATA RECEIVED:", categoryCountsQuery.data);
  }, [brandCountsQuery.data, categoryCountsQuery.data]);

  // Products query uses 'productsData' and 'productsLoading' to avoid collision
  const { 
    data: productsData, 
    isLoading: productsLoading, 
    error: productsError, 
    isFetching: productsFetching 
  } = useQuery({
    queryKey: ["products", currentPage, activeTypeSlugs.join(","), activeBrandSlugs.join(","), activeCatSlugs.join(","), searchQuery, itemsPerPage],
    enabled: !!filters,
    queryFn: () => {
      const params: Record<string, string | number | string[]> = {
        page: currentPage,
        per_page: itemsPerPage,
      };

      if (searchQuery) params.search = searchQuery;
      
      const typeIds = types.filter(t => activeTypeSlugs.includes(t.slug)).map(t => t.id);
      const brandIds = brands.filter(b => activeBrandSlugs.includes(b.slug)).map(b => b.id);
      const catIds = categories.filter(c => activeCatSlugs.includes(c.slug)).map(c => c.id);

      if (typeIds.length > 0) {
        params.category = typeIds.join(",");
      }

      let attrIndex = 0;
      // Index each individual attribute selection as its own group
      brandIds.forEach(id => {
        params[`attributes[${attrIndex}][attribute]`] = "pa_brand";
        params[`attributes[${attrIndex}][term_id]`] = id;
        attrIndex++;
      });
      
      catIds.forEach(id => {
        params[`attributes[${attrIndex}][attribute]`] = "pa_category_furniture";
        params[`attributes[${attrIndex}][term_id]`] = id;
        attrIndex++;
      });

      return fetchProducts(params);
    },
    placeholderData: (previousData) => previousData,
  });

  // Robust getCount function for Attribute-based Faceted Filtering
  const getCount = (taxonomy: string, termId: number) => {
    let rawData = null;
    if (taxonomy === "pa_brand") rawData = brandCountsQuery.data;
    else if (taxonomy === "pa_category_furniture") rawData = categoryCountsQuery.data;
    else if (taxonomy === "product_cat") rawData = typeCountsQuery.data;

    if (!rawData) return 0;
    const data = rawData as any;
    
    // In this API version, we found that requesting 'product_cat' counts via 'calculate_attribute_counts'
    // returns them in the 'attribute_counts' array.
    const list = data.attribute_counts || [];
    
    if (!Array.isArray(list)) return 0;

    const found = list.find((c: any) => {
      const cId = Number(c.term || c.id || c.term_id);
      return cId === Number(termId);
    });
    
    return found ? found.count : 0;
  };

  const isFetchingRefetch = productsLoading === false && productsFetching === true;

  const products = productsData?.data || [];
  const totalPages = productsData?.totalPages || 0;

  const toggleFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    const currentParam = newParams.get(key);
    let values = currentParam ? currentParam.split(",").filter(Boolean) : [];
    
    if (values.includes(value)) {
      values = values.filter(v => v !== value);
    } else {
      values = [...values, value];
    }
    
    if (values.length > 0) {
      newParams.set(key, values.join(","));
    } else {
      newParams.delete(key);
    }
    
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    newParams.set("page", "1");
    if (searchQuery) newParams.set("search", searchQuery);
    setSearchParams(newParams);
    setSidebarOpen(false);
  };

  const isAnyFilterActive = activeTypeSlugs.length > 0 || activeBrandSlugs.length > 0 || activeCatSlugs.length > 0;

  const activeTypes = types.filter(c => activeTypeSlugs.includes(c.slug));
  const activeBrands = brands.filter(b => activeBrandSlugs.includes(b.slug));
  const activeCatAttrs = categories.filter(c => activeCatSlugs.includes(c.slug));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex flex-1 relative overflow-hidden">
        {/* Pushing Sidebar */}
        <aside
          className={`bg-white border-r border-gray-100 z-40 transition-all duration-500 ease-in-out flex flex-col overflow-hidden ${
            sidebarOpen ? "w-80" : "w-0"
          }`}
        >
          {/* Inner container to prevent flickering during resize */}
          <div className="w-80 flex-shrink-0 flex flex-col h-full bg-white">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-heading font-bold uppercase tracking-widest text-sm">
                Filters
              </h2>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {isAnyFilterActive && (
            <button 
              onClick={clearFilters}
              className="w-full py-2 px-4 border border-primary text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-300 mb-2"
            >
              Clear All Filters
            </button>
          )}

          {/* Types Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Types</h3>
              {activeTypeSlugs.length > 0 && (
                <button 
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("filter_type");
                    setSearchParams(params);
                  }}
                  className="text-[10px] text-primary hover:underline uppercase font-bold"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-1">
              {hierarchicalTypes.map((parent) => {
                const isExpanded = expandedTypes.includes(parent.id);
                const hasChildren = parent.children && parent.children.length > 0;

                return (
                  <div key={parent.id} className="space-y-1">
                    {/* Top Level Type - Not Draggable */}
                    <div className="flex items-center justify-between group cursor-pointer p-1.5 rounded-md hover:bg-gray-50 transition-all" onClick={() => toggleFilter("filter_type", parent.slug)}>
                      <div className="flex items-center space-x-3 flex-1">
                        <Checkbox 
                          id={`type-${parent.id}`} 
                          checked={activeTypeSlugs.includes(parent.slug)}
                          onCheckedChange={() => {}}
                          className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label 
                          htmlFor={`type-${parent.id}`}
                          className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors flex-1"
                        >
                          {decodeHtmlEntities(parent.name)}
                        </Label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground/40 bg-gray-50 px-1.5 py-0.5 rounded-sm min-w-[24px] text-center">
                          {typeCountsQuery.data ? getCount("product_cat", parent.id) : parent.count || 0}
                        </span>
                        {hasChildren && (
                          <button 
                            onClick={(e) => toggleExpand(parent.id, e)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Children / Sub Types - Collapsible */}
                    {hasChildren && isExpanded && (
                      <div className="pl-6 space-y-1 border-l border-gray-100 ml-2">
                        {parent.children.map((child: any) => (
                          <div 
                            key={child.id} 
                            className="flex items-center space-x-3 group cursor-pointer p-1.5 rounded-md hover:bg-gray-50 transition-all"
                            onClick={() => toggleFilter("filter_type", child.slug)}
                          >
                            <Checkbox 
                              id={`type-${child.id}`} 
                              checked={activeTypeSlugs.includes(child.slug)}
                              onCheckedChange={() => {}} 
                              className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label 
                              htmlFor={`type-${child.id}`}
                              className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors flex-1"
                            >
                              {decodeHtmlEntities(child.name)}
                            </Label>
                            <span className="text-[10px] font-bold text-muted-foreground/40 bg-gray-50 px-1.5 py-0.5 rounded-sm min-w-[24px] text-center">
                              {typeCountsQuery.data ? getCount("product_cat", child.id) : child.count || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Categories Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categories</h3>
              {activeCatSlugs.length > 0 && (
                <button 
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("filter_cat");
                    setSearchParams(params);
                  }}
                  className="text-[10px] text-primary hover:underline uppercase font-bold"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-1">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center space-x-3 group cursor-pointer p-1.5 rounded-md hover:bg-gray-50 transition-all" onClick={() => toggleFilter("filter_cat", cat.slug)}>
                  <Checkbox 
                    id={`cat-${cat.id}`} 
                    checked={activeCatSlugs.includes(cat.slug)}
                    onCheckedChange={() => {}} // Handled by div click
                    className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label 
                    htmlFor={`cat-${cat.id}`}
                    className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors flex-1"
                  >
                    {decodeHtmlEntities(cat.name)}
                  </Label>
                  <span className="text-[10px] font-bold text-muted-foreground/40 bg-gray-50 px-1.5 py-0.5 rounded-sm min-w-[24px] text-center">
                    {categoryCountsQuery.data ? getCount("pa_category_furniture", cat.id) : "..."}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Brands Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Brands</h3>
              {activeBrandSlugs.length > 0 && (
                <button 
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("filter_brand");
                    setSearchParams(params);
                  }}
                  className="text-[10px] text-primary hover:underline uppercase font-bold"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-1">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-3 group cursor-pointer p-1.5 rounded-md hover:bg-gray-50 transition-all" onClick={() => toggleFilter("filter_brand", brand.slug)}>
                  <Checkbox 
                    id={`brand-${brand.id}`} 
                    checked={activeBrandSlugs.includes(brand.slug)}
                    onCheckedChange={() => {}} // Handled by div click
                    className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label 
                    htmlFor={`brand-${brand.id}`}
                    className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors flex-1"
                  >
                    {decodeHtmlEntities(brand.name)}
                  </Label>
                  <span className="text-[10px] font-bold text-muted-foreground/40 bg-gray-50 px-1.5 py-0.5 rounded-sm min-w-[24px] text-center">
                    {brandCountsQuery.data ? getCount("pa_brand", brand.id) : "..."}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </aside>

      <main className="flex-1 overflow-y-auto">
        {/* Page Header Detail Section */}
        <section className="w-full max-w-[1920px] mx-auto px-4 md:px-6 pt-8 pb-4">
          {/* Main Title - Centered */}
          <div className="text-center mb-10">
            <h1 style={{ fontSize: '34px', fontWeight: 600, color: '#242424', fontFamily: 'Montserrat' }} className="font-heading">
              Products
            </h1>
          </div>

          {/* Navigation / Sidebar Toggle / Breadcrumbs Section */}
          <div className="flex flex-col items-start gap-4 mb-6">
            {/* Sidebar Toggle Button - Stuck to edge, expands on hover */}
            {!sidebarOpen && (
              <div className="-ml-4 md:-ml-6 group/sidebar">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="h-12 w-12 hover:w-40 flex items-center justify-start bg-white border border-l-0 border-gray-200 rounded-r-md shadow-[4px_0_10px_rgba(0,0,0,0.05)] text-[#242424] transition-all duration-300 ease-in-out overflow-hidden px-3.5 group"
                  title="Open Filters"
                >
                  <div className="flex items-center gap-2.5 min-w-max">
                    <Menu className="w-5 h-5 flex-shrink-0" />
                    <span style={{ color: '#777', fontSize: '13px' }} className="font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      Open sidebar
                    </span>
                  </div>
                </button>
              </div>
            )}

            {/* Breadcrumbs & Active Filters */}
            <div className="flex flex-col gap-3 ml-0 md:ml-4">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                <Link to="/products" className="hover:text-foreground transition-colors font-medium text-foreground">Products</Link>
                {currentPage > 1 && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    <span className="text-foreground/80 font-medium">Page {currentPage}</span>
                  </>
                )}
              </div>
              
              {isAnyFilterActive && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {activeTypes.map(c => (
                    <Badge key={c.id} variant="secondary" className="bg-gray-100 text-[#242424] hover:bg-gray-200 border-none px-3 py-1 flex items-center gap-2 rounded-full cursor-pointer" onClick={() => toggleFilter("filter_type", c.slug)}>
                      {c.name} <X className="w-3 h-3" />
                    </Badge>
                  ))}
                  {activeCatAttrs.map(c => (
                    <Badge key={c.id} variant="secondary" className="bg-gray-100 text-[#242424] hover:bg-gray-200 border-none px-3 py-1 flex items-center gap-2 rounded-full cursor-pointer" onClick={() => toggleFilter("filter_cat", c.slug)}>
                      {c.name} <X className="w-3 h-3" />
                    </Badge>
                  ))}
                  {activeBrands.map(b => (
                    <Badge key={b.id} variant="secondary" className="bg-gray-100 text-[#242424] hover:bg-gray-200 border-none px-3 py-1 flex items-center gap-2 rounded-full cursor-pointer" onClick={() => toggleFilter("filter_brand", b.slug)}>
                      {b.name} <X className="w-3 h-3" />
                    </Badge>
                  ))}
                  <button onClick={clearFilters} className="text-xs text-primary font-bold hover:underline ml-1">
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="w-full h-[1px] bg-gray-200/60" />

          {/* Grid Controls (Show, View) */}
          <div className="flex items-center justify-end gap-6 py-2 opacity-70">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <span>Show:</span>
              <div className="flex items-center gap-2">
                {[12, 16, 24, 32].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setItemsPerPage(num);
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set("page", "1");
                      setSearchParams(newParams);
                    }}
                    className={`transition-colors hover:text-foreground ${itemsPerPage === num ? "text-foreground font-black underline underline-offset-4" : ""}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 border-l border-border pl-6">
              {[3, 4, 5].map((col) => (
                <button
                  key={col}
                  onClick={() => setGridCols(col)}
                  className={`p-1 transition-colors ${gridCols === col ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  title={`${col} Column View`}
                >
                  <div className={`grid gap-[1px] ${col === 3 ? "grid-cols-3" : col === 4 ? "grid-cols-4" : "grid-cols-5"}`}>
                    {Array.from({ length: col }).map((_, i) => (
                      <div key={i} className="w-1 h-3 border-[1px] border-current opacity-60" />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className={`w-full max-w-[1920px] mx-auto px-4 md:px-6 pt-4 pb-20 relative ${isFetchingRefetch ? "opacity-60 transition-opacity" : ""}`}>
          {isFetchingRefetch && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          {(productsLoading || !filters) ? (
            <div className={`grid gap-6 ${
              gridCols === 1 ? "grid-cols-1" :
              gridCols === 2 ? "grid-cols-2" :
              gridCols === 3 ? "grid-cols-2 md:grid-cols-3" :
              "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            }`}>
              {Array.from({ length: itemsPerPage }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-square bg-black/5 animate-pulse rounded-2xl" />
                  <div className="h-4 w-2/3 bg-black/5 animate-pulse rounded" />
                  <div className="h-4 w-1/3 bg-black/5 animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : productsError ? (
            <div className="text-center py-20 min-h-[400px] flex flex-col items-center justify-center">
              <p className="text-red-500 font-medium mb-4">{productsError instanceof Error ? productsError.message : "Failed to fetch products"}</p>
              <button 
                onClick={() => {
                  const newParams = new URLSearchParams();
                  newParams.set("page", "1");
                  setSearchParams(newParams);
                }}
                className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-all font-bold uppercase tracking-widest text-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : filters && products.length === 0 ? (
            <div className="text-center py-20 min-h-[400px] flex flex-col items-center justify-center">
              <div className="mb-6 opacity-20">
                <X className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-[#242424] font-bold text-xl mb-2">No products found</p>
              <p className="text-muted-foreground mb-8">We couldn't find any products matching your current filters.</p>
              <button 
                onClick={clearFilters}
                className="px-8 py-3 bg-black text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#CD2727] transition-all"
              >
                View all products
              </button>
            </div>
          ) : (
            <>
              <div className={`grid gap-6 ${
                gridCols === 1 ? "grid-cols-1" :
                gridCols === 2 ? "grid-cols-2" :
                gridCols === 3 ? "grid-cols-2 md:grid-cols-3" :
                "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              }`}>
                {products.map((product) => {
                  // Fallback for slug if it's missing from the API response
                  const productSlug = product.slug || 
                                     (product.permalink ? product.permalink.split('/').filter(Boolean).pop() : null) || 
                                     product.id.toString();
                                     
                  return (
                    <ProductCard
                      key={product.id}
                      name={product.name}
                      brand={(() => {
                        const brandAttr = product.attributes?.find(attr => 
                          attr.id === BRAND_ATTR_ID || 
                          attr.name.toLowerCase().includes("brand") || 
                          attr.name.toLowerCase().includes("ماركة")
                        );
                        return brandAttr?.terms?.[0]?.name;
                      })()}
                      image={getOriginalImage(product.images[0]?.src)}
                      slug={productSlug}
                    />
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-16 pb-12">
                  <div className="flex items-center gap-2 md:gap-4">
                    {/* Previous Page Arrow - Only shows if not on first page */}
                    <div className="w-8 flex items-center justify-center">
                      {currentPage > 1 && (
                        <button
                          onClick={() => {
                            const newParams = new URLSearchParams(searchParams);
                            newParams.set("page", (currentPage - 1).toString());
                            setSearchParams(newParams);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="flex items-center justify-center text-[#0a3055] hover:text-[#CD2727] transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {getPaginationItems(currentPage, totalPages).map((page, idx) => (
                      page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-[#0a3055] font-semibold text-[15px]">...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => {
                            const newParams = new URLSearchParams(searchParams);
                            newParams.set("page", page.toString());
                            setSearchParams(newParams);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`w-10 h-10 flex items-center justify-center transition-all text-[15px] ${
                            page === currentPage
                              ? "bg-[#CD2727] text-white font-medium"
                              : "text-[#0a3055] hover:text-[#CD2727] font-medium"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}

                    {/* Next Page Arrow - Only shows if there are more pages */}
                    <div className="w-8 flex items-center justify-center">
                      {currentPage < totalPages && (
                        <button
                          onClick={() => {
                            const newParams = new URLSearchParams(searchParams);
                            newParams.set("page", (currentPage + 1).toString());
                            setSearchParams(newParams);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="flex items-center justify-center text-[#0a3055] hover:text-[#CD2727] transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>

    <Footer />
  </div>
);
};

export default Products;
