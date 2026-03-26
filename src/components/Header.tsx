import { Search, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchPartners, decodeHtmlEntities } from "@/lib/api";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Our Partners", href: "/our-partners", hasDropdown: true },
  { label: "Products", href: "/products" },
  { label: "Catalogues", href: "/catalogues" },
  { label: "Projects", href: "/projects" },
  { label: "About us", href: "/about-us" },
  { label: "Blog", href: "/blog" },
  { label: "Contact us", href: "/contact-us", isCta: true },
];

interface Partner {
  id: number;
  partner_details: {
    brand_name: string;
    brand_id?: string;
    order?: number;
  };
}

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersOpen, setPartnersOpen] = useState(false);
  const [mobilePartnersOpen, setMobilePartnersOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadPartners = async () => {
      try {
        const data = await fetchPartners();
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => {
            const orderA = a.partner_details?.order || 0;
            const orderB = b.partner_details?.order || 0;
            return (orderA || 999) - (orderB || 999);
          });
          setPartners(sorted);
        }
      } catch (err) {
        console.error("Failed to fetch partners for header", err);
      }
    };
    loadPartners();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[999] bg-white border-b border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6 lg:px-10 flex items-center h-16 md:h-20 lg:h-24">
        
        {/* Mobile Menu Button - Left */}
        <div className="min-[1387px]:hidden flex-1">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-[#1a1a1a] hover:bg-gray-100 rounded-md transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Logo - Centered on Mobile, Left on Desktop */}
        <div className="flex-none min-[1387px]:flex-1 flex justify-center min-[1387px]:xl:justify-start">
          <Link to="/" className="flex items-center group">
            <img 
              src="https://innovo-eg.com/wp-content/uploads/2020/10/Innovo-Logo-Small.png" 
              alt="Innovo" 
              className="h-8 md:h-10 lg:h-12 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Desktop Navigation - Optimized Spacing */}
        <nav className="hidden min-[1387px]:flex min-[1387px]:flex-[4] items-center justify-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            
            if (link.isCta) {
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className="ml-4 bg-[#CD2727] text-white px-5 py-2.5 rounded-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#b22020] transition-all duration-300 shadow-sm active:scale-95"
                >
                  {link.label}
                </Link>
              );
            }

            if (link.hasDropdown) {
              return (
                <div 
                  key={link.label}
                  className="relative group/dropdown py-4 px-2"
                  onMouseEnter={() => setPartnersOpen(true)}
                  onMouseLeave={() => setPartnersOpen(false)}
                >
                  <Link
                    to={link.href}
                    className={cn(
                      "flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wider transition-all duration-300 relative group",
                      isActive ? "text-[#CD2727]" : "text-[#333] hover:text-[#CD2727]"
                    )}
                  >
                    {link.label}
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", partnersOpen ? "rotate-180" : "")} />
                    <span className={cn(
                      "absolute -bottom-1 left-0 right-0 h-[2px] bg-[#CD2727] transition-transform duration-300 ease-in-out origin-left scale-x-0 group-hover:scale-x-100 will-change-transform transform-gpu",
                      isActive && "scale-x-100"
                    )} />
                  </Link>
                  
                  {/* Dropdown Box */}
                  <div className={cn(
                    "absolute top-[calc(100%-8px)] left-1/2 -translate-x-1/2 min-w-[220px] bg-white shadow-xl rounded-lg border-t-2 border-[#CD2727] py-3 transition-all duration-300 before:absolute before:-top-4 before:left-0 before:right-0 before:h-4 before:content-[''] z-50",
                    partnersOpen ? "opacity-100 visible translate-y-2" : "opacity-0 invisible translate-y-4"
                  )}>
                    <div className="max-h-[70vh] overflow-y-auto scrollbar-none px-2">
                      {partners.map((p) => {
                        const brandId = p.partner_details.brand_id || p.partner_details.brand_name.toLowerCase().replace(/\s+/g, '-');
                        return (
                          <Link
                            key={p.id}
                            to={`/our-partners#${brandId}`}
                            className="block px-4 py-3 text-[13px] font-bold text-gray-600 hover:text-[#CD2727] hover:bg-gray-50 rounded-md transition-all border-b border-gray-50/50 last:border-0"
                            onClick={() => setPartnersOpen(false)}
                          >
                            {decodeHtmlEntities(p.partner_details.brand_name)}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={link.label}
                to={link.href}
                className={cn(
                  "px-3 py-4 text-[13px] font-bold uppercase tracking-wider transition-all duration-300 relative group",
                  isActive ? "text-[#CD2727]" : "text-[#333] hover:text-[#CD2727]"
                )}
              >
                {link.label}
                <span className={cn(
                  "absolute bottom-3 left-3 right-3 h-[2px] bg-[#CD2727] transition-transform duration-300 ease-in-out origin-left scale-x-0 group-hover:scale-x-100 will-change-transform transform-gpu",
                  isActive && "scale-x-100"
                )} />
              </Link>
            );
          })}
        </nav>

        {/* Right Section - Search & Placeholder for Balance */}
        <div className="flex-1 min-[1387px]:flex-1 flex items-center justify-end gap-2 md:gap-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={cn(
              "p-2 text-[#1a1a1a] hover:bg-gray-100 rounded-full transition-all",
              searchOpen && "text-[#CD2727] bg-red-50"
            )}
          >
            <Search className="w-5 h-5 md:w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="absolute inset-x-0 top-full bg-white border-b border-gray-100 shadow-xl animate-in slide-in-from-top-2 duration-200 z-[1001]">
          <div className="max-w-4xl mx-auto px-6 py-6 lg:py-10">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <input
                type="text"
                autoFocus
                placeholder="Search for products, styles or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-8 py-5 text-lg focus:ring-2 focus:ring-[#CD2727]/20 transition-all placeholder:text-gray-400"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#CD2727]">
                <X className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Navigation */}
      <div className={cn(
        "fixed inset-0 z-[2000] pointer-events-none transition-all duration-500 min-[1387px]:hidden",
        mobileMenuOpen ? "pointer-events-auto opacity-100" : "opacity-0"
      )}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        <div className={cn(
          "absolute inset-y-0 left-0 w-[80%] max-w-[320px] bg-white transition-transform duration-500 ease-out flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 flex items-center justify-between border-b border-gray-50">
            <img src="https://innovo-eg.com/wp-content/uploads/2020/10/Innovo-Logo-Small.png" alt="Innovo" className="h-8 w-auto" />
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-50 rounded-full"><X className="w-6 h-6" /></button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <div key={link.label}>
                  {link.hasDropdown ? (
                    <>
                      <button
                        onClick={() => setMobilePartnersOpen(!mobilePartnersOpen)}
                        className="w-full flex items-center justify-between px-8 py-4 text-[15px] font-bold text-[#333] tracking-wide"
                      >
                        {link.label}
                        <ChevronDown className={cn("w-4 h-4 transition-transform", mobilePartnersOpen ? "rotate-180" : "")} />
                      </button>
                      <div className={cn("bg-gray-50 overflow-hidden transition-all duration-300", mobilePartnersOpen ? "max-h-[800px]" : "max-h-0")}>
                        {partners.map((p) => (
                          <Link
                            key={p.id}
                            to={`/our-partners#${p.partner_details.brand_id || p.partner_details.brand_name.toLowerCase().replace(/\s+/g, '-')}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-12 py-3 text-gray-500 font-medium text-sm hover:text-[#CD2727]"
                          >
                            {p.partner_details.brand_name}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "block px-8 py-4 text-[15px] font-bold tracking-wide transition-colors",
                        isActive ? "text-[#CD2727]" : "text-[#333] hover:text-[#CD2727]",
                        link.isCta && "bg-red-50/50 mt-4 text-[#CD2727] text-center"
                      )}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
