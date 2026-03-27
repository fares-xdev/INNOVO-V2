import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCatalogueBySlug, decodeHtmlEntities } from "@/lib/api";
import { Loader2, FileText, Download, ChevronLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

const CatalogueDetailV2 = () => {
  const { slug } = useParams<{ slug: string }>();
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!slug) return;
      try {
        const data = await fetchCatalogueBySlug(slug) as Catalogue | null;
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
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#dd0000] opacity-20" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!catalogue) return null;

  const brandName = catalogue.catalogue_details?.brand_name || decodeHtmlEntities(catalogue.title.rendered);
  const logoUrl = catalogue._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const pdfs = (catalogue.catalogue_details?.pdfs || []).filter(pdf => 
    pdf.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />
      
      <main className="flex-grow py-12 px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto w-full">
        {/* Simple Header */}
        <div className="flex flex-col items-center mb-12 border-b border-gray-100 pb-12">
           {logoUrl && (
             <img src={logoUrl} alt={brandName} className="h-20 w-auto object-contain mb-6" />
           )}
           <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              {brandName} <span className="text-gray-400 font-light">Downloads</span>
           </h1>
           <Link to="/catalogues-v2" className="mt-4 text-xs text-gray-400 hover:text-[#dd0000] font-medium uppercase tracking-widest flex items-center gap-2">
              <ChevronLeft className="w-3 h-3" /> Back to Catalogues
           </Link>
        </div>

        {/* Table Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
           <div className="text-sm text-gray-500 font-medium">
              Display <span className="border rounded px-2 py-1 mx-1">20</span> downloads per page
           </div>
           <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">Search:</span>
              <div className="relative">
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 h-10 border-gray-200 focus-visible:ring-[#dd0000] rounded-sm"
                />
              </div>
           </div>
        </div>

        {/* Downloads Table */}
        <div className="border border-gray-100 rounded-sm overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-b border-gray-100">
                <TableHead className="text-[11px] font-bold text-gray-800 uppercase tracking-wider py-4">TITLE</TableHead>
                <TableHead className="text-[11px] font-bold text-gray-800 uppercase tracking-wider hidden md:table-cell">CATEGORIES</TableHead>
                <TableHead className="text-[11px] font-bold text-gray-800 uppercase tracking-wider hidden lg:table-cell">UPDATE DATE</TableHead>
                <TableHead className="text-[11px] font-bold text-gray-800 uppercase tracking-wider text-right pr-8">DOWNLOAD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pdfs.length > 0 ? (
                pdfs.map((pdf) => (
                  <TableRow key={pdf.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <TableCell className="py-5">
                      <div className="flex items-center gap-4">
                        <div className="bg-red-50 p-2 rounded-sm text-red-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm mb-0.5">{decodeHtmlEntities(pdf.title)}</p>
                          <p className="text-[10px] text-gray-400 font-medium">1 file(s) • {pdf.size}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-blue-500 font-medium hidden md:table-cell">
                      {brandName}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 hidden lg:table-cell">
                      {pdf.date || "March 11, 2021"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button 
                        asChild
                        className="bg-[#4285F4] hover:bg-blue-600 text-white rounded-sm h-10 px-8 text-[11px] font-bold uppercase tracking-wider shadow-sm transition-all"
                      >
                        <a href={pdf.url} download target="_blank">
                          Download
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center text-gray-400 font-medium">
                    No files found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CatalogueDetailV2;
