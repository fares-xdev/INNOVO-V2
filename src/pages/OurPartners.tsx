import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocation } from "react-router-dom";
import { ChevronUp, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { fetchPartners } from "@/lib/api";

interface WordPressPartner {
  id: number;
  partner_details: {
    brand_id: string;
    brand_name: string;
    description: string;
    link: string;
    background_image: string;
    order?: number;
  };
}

const PartnerSection = ({ partner }: { partner: WordPressPartner }) => {
  const [offset, setOffset] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        const totalDist = windowHeight + rect.height;
        const currentDist = windowHeight - rect.top;
        const progress = currentDist / totalDist;
        
        const moveRange = 150; // Increased significantly for a very visible "floating" effect
        const newOffset = (progress - 0.5) * -moveRange * 2;
        
        setOffset(newOffset);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const details = partner.partner_details;
  const bgImage = details?.background_image || "/placeholder.svg";
  const brandName = details?.brand_name || "Partner";
  const description = details?.description || "";
  const link = details?.link || "#";

  return (
    <section
      ref={sectionRef}
      id={details?.brand_id || brandName.toLowerCase().replace(/\s+/g, '-')}
      className="relative h-[80vh] md:h-screen w-full overflow-hidden flex items-center"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${bgImage})`,
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="relative z-10 w-full flex justify-end pr-2 md:pr-4 lg:pr-10">
        <div className="animate-fade-in-right w-full flex justify-end">
          <div 
            className="bg-[#dd0000] text-white p-4 md:p-7 lg:p-10 w-full max-w-[700px] shadow-2xl flex flex-col justify-center will-change-transform"
            style={{ 
              transform: `translate3d(0, ${offset}px, 0)`,
              transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)' // 'Buoyant' feel
            }}
          >
            {description && (
              <p className="text-[24px] text-white mb-4 opacity-80 font-montserrat">
                {description}
              </p>
            )}
            
            <div className="relative mb-5 pb-4">
               <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold font-montserrat mb-4 tracking-tight leading-tight text-white uppercase">
                {brandName}
              </h2>
              
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/30" />
              <div className="absolute bottom-0 left-0 w-1/4 h-[3px] bg-white" />
            </div>

            <div className="mt-4">
              <a 
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-[#333] px-8 py-3.5 text-[11px] md:text-xs font-semibold uppercase tracking-[0.1em] hover:bg-[#E8E8E8] transition-all duration-300 shadow-sm"
              >
                Visit Website
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const OurPartners = () => {
  const [partners, setPartners] = useState<WordPressPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleHashScroll = () => {
      if (!isLoading && partners.length > 0 && window.location.hash) {
        const id = window.location.hash.substring(1);
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500); 
      }
    };
    handleHashScroll();
  }, [isLoading, partners, location.hash]);

  useEffect(() => {
    const loadPartners = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPartners();
        if (Array.isArray(data)) {
          // Sort by the new 'order' field (ascending)
          const sorted = [...data].sort((a, b) => {
            const orderA = a.partner_details?.order || 0;
            const orderB = b.partner_details?.order || 0;
            
            // If both have 0 or same order, keep original (usually date)
            if (orderA === orderB) return 0;
            // If one is 0, move it to the end (optional, but usually preferred if not set)
            if (orderA === 0) return 1;
            if (orderB === 0) return -1;
            
            return orderA - orderB;
          });
          setPartners(sorted);
        } else {
          setPartners([]);
        }
      } catch (err) {
        console.error("Failed to fetch partners", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPartners();

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#dd0000]" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-montserrat overflow-x-hidden">
      <Header />
      <main className="flex-grow">
        {partners.length > 0 ? (
          partners.map((partner) => (
            <PartnerSection key={partner.id} partner={partner} />
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
            <h2 className="text-2xl font-bold text-gray-400">No partner data found yet.</h2>
            <p className="text-gray-500 mt-2">Please add some partners in the WordPress dashboard.</p>
          </div>
        )}
      </main>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-10 right-10 w-12 h-12 flex items-center justify-center rounded-full bg-[#dd0000] text-white hover:bg-black transition-all duration-300 shadow-lg z-50 group"
        >
          <ChevronUp className="w-6 h-6 group-hover:mb-1 transition-all" />
        </button>
      )}
      <Footer />
    </div>
  );
};

export default OurPartners;
