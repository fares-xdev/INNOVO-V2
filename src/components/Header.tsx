import { Search, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchPartners } from "@/lib/api";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
          // Sort by the 'order' field (ascending)
          const sorted = [...data].sort((a, b) => {
            const orderA = a.partner_details?.order || 0;
            const orderB = b.partner_details?.order || 0;
            
            if (orderA === orderB) return 0;
            if (orderA === 0) return 1;
            if (orderB === 0) return -1;
            
            return orderA - orderB;
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border/40">
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6 flex items-center h-16 md:h-20">
        {/* Mobile Menu Toggle - Left */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden text-foreground p-2 -ml-2"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo - Centered on Mobile/Tablet, Left on Desktop */}
        <div className="flex-1 flex justify-center xl:justify-start">
          <Link to="/" className="flex items-center">
            <img 
              src="https://innovo-eg.com/wp-content/uploads/2020/10/Innovo-Logo-Small.png" 
              alt="Innovo" 
              className="h-8 md:h-12 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-4 lg:gap-8 absolute left-1/2 -translate-x-1/2 h-full">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            
            if (link.hasDropdown) {
              return (
                <div 
                  key={link.label}
                  className="relative h-full flex items-center group/dropdown"
                  onMouseEnter={() => setPartnersOpen(true)}
                  onMouseLeave={() => setPartnersOpen(false)}
                >
                  <Link
                    to={link.href}
                    className={`relative py-1 text-xs uppercase tracking-widest font-semibold transition-colors flex items-center gap-1 whitespace-nowrap ${
                      isActive ? "text-[#CD2727]" : "text-muted-foreground hover:text-[#CD2727]"
                    }`}
                  >
                    {link.label}
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${partnersOpen ? "rotate-180" : ""}`} />
                    <span 
                      className={`absolute bottom-0 left-0 h-[1.5px] w-full bg-[#CD2727] transition-transform duration-300 ease-out origin-left scale-x-0 group-hover/dropdown:scale-x-100 ${isActive ? "scale-x-100" : ""}`}
                    />
                  </Link>

                  {/* Dropdown Menu */}
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 min-w-[200px] bg-white shadow-xl rounded-b-md border-t-2 border-[#CD2727] py-2 transition-all duration-300 ${
                    partnersOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                  }`}>
                    {partners.length > 0 ? (
                      partners.map((p) => {
                        const brandId = p.partner_details.brand_id || p.partner_details.brand_name.toLowerCase().replace(/\s+/g, '-');
                        return (
                          <Link
                            key={p.id}
                            to={`/our-partners#${brandId}`}
                            className="block px-6 py-3 text-[13px] font-bold text-gray-600 hover:text-[#CD2727] hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                            onClick={() => setPartnersOpen(false)}
                          >
                            {p.partner_details.brand_name}
                          </Link>
                        );
                      })
                    ) : (
                      <div className="px-6 py-3 text-[10px] text-gray-400">Loading brands...</div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={link.label}
                to={link.href}
                className={`relative py-1 text-xs uppercase tracking-widest font-semibold transition-colors whitespace-nowrap group ${
                  link.isCta
                    ? "text-nav-cta hover:text-nav-cta/80 font-bold"
                    : isActive
                    ? "text-[#CD2727]"
                    : "text-muted-foreground hover:text-[#CD2727]"
                }`}
              >
                {link.label}
                {!link.isCta && (
                  <span 
                    className={`absolute bottom-0 left-0 h-[1.5px] w-full bg-[#CD2727] transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100 ${isActive ? "scale-x-100" : ""}`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Icons - Right */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`text-foreground hover:text-primary transition-colors p-1 ${searchOpen ? "text-primary" : ""}`}
            title="Toggle Search"
          >
            <Search className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Search Bar Overlay */}
      {searchOpen && (
        <div className="absolute inset-x-0 top-full bg-background border-b border-border animate-in slide-in-from-top duration-200">
          <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6 py-4">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                autoFocus
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary/30 border-none focus:ring-1 focus:ring-primary rounded-sm px-4 py-3 text-sm"
              />
              <button 
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            className="xl:hidden fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="xl:hidden fixed inset-y-0 left-0 w-[80%] max-w-[300px] h-screen bg-white z-50 animate-in slide-in-from-left duration-300 flex flex-col shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 min-h-[64px]">
              <img 
                src="https://innovo-eg.com/wp-content/uploads/2020/10/Innovo-Logo-Small.png" 
                alt="Innovo" 
                className="h-8 w-auto object-contain"
              />
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-6 h-6 text-foreground" />
              </button>
            </div>
            <nav className="flex flex-col flex-grow bg-white">
              {navLinks.map((link) => (
                <div key={link.label} className="border-b border-gray-100 last:border-0">
                  {link.hasDropdown ? (
                    <>
                      <button
                        onClick={() => setMobilePartnersOpen(!mobilePartnersOpen)}
                        className="w-full flex items-center justify-between px-6 py-4 text-[15px] font-medium text-foreground tracking-wide hover:bg-gray-50 transition-colors"
                      >
                        {link.label}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobilePartnersOpen ? "rotate-180" : ""}`} />
                      </button>
                      <div className={`bg-gray-50/50 overflow-hidden transition-all duration-300 ${mobilePartnersOpen ? "max-h-[500px]" : "max-h-0"}`}>
                        {partners.map((p) => {
                          const brandId = p.partner_details.brand_id || p.partner_details.brand_name.toLowerCase().replace(/\s+/g, '-');
                          return (
                            <Link
                              key={p.id}
                              to={`/our-partners#${brandId}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block px-10 py-4 text-[15px] text-gray-600 hover:text-primary transition-colors border-b border-gray-100/50 last:border-0"
                            >
                              {p.partner_details.brand_name}
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <Link
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-6 py-4 text-[15px] font-medium text-foreground tracking-wide hover:bg-gray-50 transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
