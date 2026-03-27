import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCatalogueBySlug, decodeHtmlEntities } from "@/lib/api";
import { Loader2, FileText, Download, ChevronLeft, Calendar, Tag } from "lucide-react";

interface PDF {
  id: number;
  title: string;
  url: string;
  size: string;
  date: string;
}

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
    pdfs: PDF[];
  };
}

const PDFRow = ({ pdf, brandName }: { pdf: PDF; brandName: string }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors duration-300">
      <div className="flex items-center gap-6 flex-1 w-full overflow-hidden">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-red-50 text-[#dd0000] rounded-sm group">
          <FileText className="w-6 h-6 transform group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="truncate flex-grow">
          <h4 className="text-lg font-bold font-montserrat text-[#1a1a1a] truncate m-0">
            {decodeHtmlEntities(pdf.title)}
          </h4>
          <div className="flex gap-4 mt-1 text-[11px] text-gray-400 font-montserrat uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {pdf.date}</span>
            <span className="flex items-center gap-1.5"><Tag className="w-3 h-3" /> {brandName}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-8 w-full md:w-auto mt-6 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
        <div className="hidden lg:block text-right">
          <span className="block text-[10px] text-gray-400 font-montserrat uppercase tracking-widest font-semibold mb-1">File Size</span>
          <span className="text-sm font-bold text-gray-600 font-montserrat">{pdf.size}</span>
        </div>
        <a 
          href={pdf.url} 
          download
          target="_blank"
          className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#dd0000] text-white px-8 py-3.5 rounded-sm transition-all duration-500 font-montserrat font-bold text-xs uppercase tracking-[0.1em] shadow-lg hover:shadow-2xl"
        >
          <Download className="w-4 h-4" />
          <span>Download (PDF)</span>
        </a>
      </div>
    </div>
  );
};

const CatalogueDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!slug) return;
      try {
        const data = await fetchCatalogueBySlug(slug);
        setCatalogue(data);
      } catch (error) {
        console.error("Error fetching catalogue detail:", error);
        setCatalogue(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#dd0000]" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!catalogue) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold font-montserrat text-gray-300">Catalogue Not Found</h2>
          <Link to="/catalogue-grid" className="mt-4 text-[#dd0000] font-bold underline">Back to all Catalogues</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const brandName = catalogue.catalogue_details?.brand_name || decodeHtmlEntities(catalogue.title.rendered);
  const description = catalogue.catalogue_details?.description || "";
  const pdfs = catalogue.catalogue_details?.pdfs || [];
  const logoUrl = catalogue._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Header Section */}
      <section className="bg-black text-white pt-10 pb-20 px-4">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          {logoUrl && (
            <div className="bg-white p-4 rounded-sm mb-8 w-48 h-24 flex items-center justify-center">
              <img src={logoUrl} alt={brandName} className="max-h-full max-w-full object-contain" />
            </div>
          )}
          {description && (
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-4">
              {description}
            </span>
          )}
          <h1 className="text-4xl md:text-6xl font-extrabold font-montserrat uppercase tracking-tight !text-white !p-0 !mt-0 !mb-0">
            {brandName} <span className="text-primary">Catalogues</span>
          </h1>
        </div>
      </section>

      <main className="flex-grow pb-24 px-4 md:px-8 max-w-6xl mx-auto w-full -mt-20 relative z-20">
        <div className="bg-white rounded-sm shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden">
          {/* Header Row (Desktop Only) */}
          <div className="hidden md:flex items-center justify-between p-6 bg-[#1a1a1a] text-white border-b border-white/5">
             <div className="flex-1 font-montserrat text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">Catalogue Item / Brand Details</div>
             <div className="flex items-center gap-8 font-montserrat text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">
                <div className="hidden lg:block w-[100px] text-right pr-12">File Size</div>
                <div className="w-[180px] text-center">Action</div>
             </div>
          </div>

          <div className="flex flex-col">
            {pdfs.length > 0 ? (
              pdfs.map((pdf) => (
                <PDFRow key={pdf.id} pdf={pdf} brandName={brandName} />
              ))
            ) : (
              <div className="p-20 text-center text-gray-400 font-montserrat">
                <p>No PDF files uploaded for this catalogue yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CatalogueDetail;
