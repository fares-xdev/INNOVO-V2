import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCatalogues, decodeHtmlEntities } from "@/lib/api";
import { Loader2, ArrowRight, ChevronRight } from "lucide-react";

interface Catalogue {
  id: number;
  title: { rendered: string };
  slug: string;
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string }>;
  };
  catalogue_details?: {
    brand_name: string;
    description: string;
    pdfs: unknown[];
  };
}

const MinimalistCard = ({ catalogue }: { catalogue: Catalogue }) => {
  const logoUrl = catalogue._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder.svg";
  const brandName = catalogue.catalogue_details?.brand_name || decodeHtmlEntities(catalogue.title.rendered);
  const pdfCount = catalogue.catalogue_details?.pdfs?.length || 0;

  return (
    <Link to={`/catalogue/${catalogue.slug}`} className="group block h-full">
      <div className="h-full flex flex-col items-center p-8 bg-white hover:bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-[#dd0000]/20 rounded-xl relative group">
        {/* Simple Centered Logo */}
        <div className="h-32 w-full flex items-center justify-center mb-6 overflow-hidden">
          <img 
            src={logoUrl} 
            alt={brandName} 
            className="max-h-full max-w-[75%] object-contain pointer-events-none"
          />
        </div>
        
        {/* Brand Info */}
        <div className="text-center w-full">
            <h3 className="text-lg font-bold text-gray-900 font-heading tracking-tight mb-1 group-hover:text-[#dd0000] transition-colors duration-300">
                {brandName}
            </h3>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-4 block">
                {pdfCount} Catalogues {pdfCount === 1 ? 'FILE' : 'FILES'}
            </span>
            
            <div className="inline-flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-widest text-[#dd0000] opacity-0 group-hover:opacity-100 transition-all duration-500">
                View Archive <ArrowRight className="w-3 h-3" />
            </div>
        </div>
      </div>
    </Link>
  );
};

const CatalogueGridV2 = () => {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCatalogues();
        setCatalogues(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching catalogues:", error);
        setCatalogues([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />
      
      <main className="flex-grow pb-40">
        {/* Unified Page Hero Section */}
        <section className="page-hero">
          <h1 className="page-hero-title">Catalogues</h1>
          <div className="page-hero-breadcrumbs">
            <Link to="/">Home</Link>
            <span className="separator"><ChevronRight className="w-4 h-4 stroke-[1.5]" /></span>
            <span className="current">Catalogues</span>
          </div>
        </section>

        <div className="container px-4 md:px-8 max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="aspect-square bg-gray-50 animate-pulse rounded-sm" />
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 -border-l border-t border-gray-100">
              {catalogues.map((item) => (
                <MinimalistCard key={item.id} catalogue={item} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CatalogueGridV2;
