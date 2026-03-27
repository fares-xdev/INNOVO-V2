import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCatalogues, decodeHtmlEntities } from "@/lib/api";
import { Loader2, ArrowRight } from "lucide-react";

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
    pdfs: any[];
  };
}

const CatalogueCard = ({ catalogue }: { catalogue: Catalogue }) => {
  const logoUrl = catalogue._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder.svg";
  const brandName = catalogue.catalogue_details?.brand_name || decodeHtmlEntities(catalogue.title.rendered);
  const description = catalogue.catalogue_details?.description || "";

  return (
    <Link 
      to={`/catalogue/${catalogue.slug}`}
      className="group bg-white p-10 flex flex-col items-center text-center shadow-[0_5px_15px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.1)] transition-all duration-500 rounded-sm border border-gray-50"
    >
      <div className="h-32 w-full flex items-center justify-center mb-8 transition-all duration-500">
        <img 
          src={logoUrl} 
          alt={brandName} 
          className="max-h-full max-w-[60%] object-contain transform group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      
      <div className="space-y-1">
        {description && (
          <span className="text-[10px] uppercase tracking-widest text-[#dd0000] font-semibold block mb-2">
            {description}
          </span>
        )}
        <h3 className="text-2xl font-bold font-montserrat text-[#1a1a1a] uppercase tracking-tight">
          {brandName}
        </h3>
        
        <div className="mt-8 mx-auto w-12 h-[2px] bg-gray-200 group-hover:w-24 group-hover:bg-[#dd0000] transition-all duration-500" />
      </div>
    </Link>
  );
};

const CatalogueGrid = () => {
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto w-full py-8">
        <div className="text-center mb-10">
          <h1 className="xts-title">
            Our <span className="text-primary">Catalogues</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-montserrat -mt-2">
            Browse and download our comprehensive range of brand catalogues to find the perfect solutions for your space.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
            {catalogues.length > 0 ? (
              catalogues.map((item) => (
                <CatalogueCard key={item.id} catalogue={item} />
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white shadow-sm rounded-lg">
                <p className="text-muted-foreground font-montserrat">No catalogues found. Check back soon!</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CatalogueGrid;
