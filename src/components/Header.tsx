import React, { useState, useEffect } from "react";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { fetchPartners, fetchProductCategories, decodeHtmlEntities, Term } from "@/lib/api";
import "./Header.css";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Our Partners", href: "/our-partners", hasDropdown: true },
  { label: "Products", href: "/products", hasDropdown: true },
  { label: "Projects", href: "/projects" },
  { label: "Catalogues", href: "/catalogues" },
  { label: "About us", href: "/about-us" },
  { label: "Blog", href: "/blog" },
  { label: "Contact us", href: "/contact-us" },
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
  const [isSticked, setIsSticked] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobilePartnersOpen, setMobilePartnersOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [categories, setCategories] = useState<Term[]>([]);
  const [partnersOpen, setPartnersOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticked(true);
      } else {
        setIsSticked(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loadMenusData = async () => {
      try {
        const partnersData = await fetchPartners();
        if (Array.isArray(partnersData)) {
          const sorted = [...partnersData].sort((a, b) => {
            const orderA = a.partner_details?.order || 0;
            const orderB = b.partner_details?.order || 0;
            return (orderA || 999) - (orderB || 999);
          });
          setPartners(sorted);
        }
      } catch (err) {
        console.error("Failed to fetch partners for header", err);
      }

      try {
        const cats = await fetchProductCategories();
        if (Array.isArray(cats)) {
          const allowedCategories = [
            "chairs", "desks", "tables", "workstations", 
            "breakout areas", "lounges", "acoustics", "carpets"
          ];
          
          const filteredCats = cats.filter((c: Term) => {
            const name = decodeHtmlEntities(c.name).toLowerCase().trim();
            const slug = c.slug.toLowerCase().trim();
            return allowedCategories.includes(name) || allowedCategories.includes(slug);
          });

          // Sort them to match the exact order requested in the image
          filteredCats.sort((a, b) => {
            const aName = decodeHtmlEntities(a.name).toLowerCase().trim();
            const bName = decodeHtmlEntities(b.name).toLowerCase().trim();
            
            let aIndex = allowedCategories.indexOf(aName);
            if (aIndex === -1) aIndex = allowedCategories.indexOf(a.slug.toLowerCase().trim());
            
            let bIndex = allowedCategories.indexOf(bName);
            if (bIndex === -1) bIndex = allowedCategories.indexOf(b.slug.toLowerCase().trim());
            
            return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
          });
          
          setCategories(filteredCats);
        }
      } catch (err) {
        console.error("Failed to fetch categories for header", err);
      }
    };
    loadMenusData();
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <header
        className={cn(
          "xts-header xts-design-default xts-with-shadow"
        )}
      >
        <div className="xts-header-main xts-header-inner">
          <div className="xts-header-row xts-general-header xts-sticky-on xts-with-bg">
            <div className="container">
              <div className="xts-header-row-inner">
                
                {/* Desktop: Left Column (Logo) */}
                <div className="xts-header-col xts-start xts-desktop">
                  <div className="xts-logo">
                    <Link to="/" rel="home">
                      <img
                        src="https://innovo-eg.com/wp-content/uploads/2020/10/Innovo-Logo-Small.png"
                        alt="Innovo"
                        className="xts-logo-main"
                      />
                    </Link>
                  </div>
                </div>

                {/* Desktop: Center Column (Navigation) */}
                <div className="xts-header-col xts-center xts-desktop">
                  <div className="xts-header-nav-wrapper xts-nav-wrapper">
                    <ul id="menu-main-menu" className="xts-nav xts-nav-main">
                      {navLinks.map((link) => (
                        <li 
                          key={link.label}
                          className={cn(link.hasDropdown && "menu-item-has-children xts-event-hover")}
                          onMouseEnter={
                            link.label === "Our Partners" ? () => setPartnersOpen(true) :
                            link.label === "Products" ? () => setCategoriesOpen(true) : undefined
                          }
                          onMouseLeave={
                            link.label === "Our Partners" ? () => setPartnersOpen(false) :
                            link.label === "Products" ? () => setCategoriesOpen(false) : undefined
                          }
                        >
                          <Link
                            to={link.href}
                            className={cn(
                              "xts-nav-link",
                              location.pathname === link.href && "active"
                            )}
                          >
                            <span className="xts-nav-text">{link.label}</span>
                            {link.hasDropdown && <ChevronDown size={14} className="xts-nav-arrow" />}
                          </Link>

                          {link.label === "Our Partners" && partners.length > 0 && (
                            <div className={cn("xts-dropdown xts-dropdown-menu", partnersOpen && "xts-opened")}>
                              <ul className="xts-sub-menu">
                                {partners.map((partner) => (
                                  <li key={partner.id} className="xts-sub-menu-item">
                                    <Link 
                                      to={`/our-partners#${partner.partner_details.brand_id || partner.partner_details.brand_name.toLowerCase().replace(/\s+/g, '-')}`}
                                      className="xts-sub-menu-link"
                                      onClick={() => setPartnersOpen(false)}
                                    >
                                      {decodeHtmlEntities(partner.partner_details.brand_name)}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {link.label === "Products" && categories.length > 0 && (
                            <div className={cn("xts-dropdown xts-dropdown-menu", categoriesOpen && "xts-opened")}>
                              <ul className="xts-sub-menu">
                                {categories.map((category) => (
                                  <li key={category.id} className="xts-sub-menu-item">
                                    <Link 
                                      to={`/products?category=${category.id}`}
                                      className="xts-sub-menu-link"
                                      onClick={() => setCategoriesOpen(false)}
                                    >
                                      {decodeHtmlEntities(category.name)}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Desktop: Right Column (Search) */}
                <div className="xts-header-col xts-end xts-desktop">
                  <div 
                    className="xts-header-search xts-header-el xts-display-full-screen xts-style-icon"
                    onClick={toggleSearch}
                  >
                    <Search size={22} className="xts-header-el-icon" />
                  </div>
                </div>

                {/* Mobile: Left Column (Burger) */}
                <div className="xts-header-col xts-start xts-mobile">
                  <div 
                    className="xts-header-mobile-burger xts-header-el xts-style-icon"
                    onClick={toggleMobileMenu}
                  >
                    <Menu size={24} className="xts-header-el-icon" />
                  </div>
                </div>

                {/* Mobile: Center Column (Logo) */}
                <div className="xts-header-col xts-center xts-mobile">
                  <div className="xts-logo">
                    <Link to="/" rel="home">
                      <img
                        src="https://innovo-eg.com/wp-content/uploads/2020/10/Innovo-Logo-Small.png"
                        alt="Innovo"
                        className="xts-logo-main"
                      />
                    </Link>
                  </div>
                </div>

                {/* Mobile: Right Column (Search) */}
                <div className="xts-header-col xts-end xts-mobile">
                  <div 
                    className="xts-header-mobile-search xts-header-el xts-display-icon xts-style-icon"
                    onClick={toggleSearch}
                  >
                    <Search size={22} className="xts-header-el-icon" />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Fullscreen Search Overlay */}
      <div className={cn("xts-search-full-screen", isSearchOpen && "xts-opened")}>
        <div className="xts-search-close" onClick={toggleSearch}>
          <X size={40} />
        </div>
        <div className="xts-search-form">
          <form role="search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              name="search"
              placeholder="Search for products..."
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus={isSearchOpen}
            />
            <div className="xts-search-hint">Press ENTER to search</div>
          </form>
        </div>
      </div>

      {/* Mobile Menu Side Drawer */}
      <div 
        className={cn("xts-mobile-menu-overlay", isMobileMenuOpen && "xts-opened")}
        onClick={toggleMobileMenu}
      />
      <div className={cn("xts-mobile-menu", isMobileMenuOpen && "xts-opened")}>
        <div className="xts-mobile-menu-header">
          <img
            src="https://innovo-eg.com/wp-content/uploads/2020/10/Innovo-Logo-Small.png"
            alt="Innovo"
            style={{ maxHeight: "40px" }}
          />
          <X size={24} onClick={toggleMobileMenu} style={{ cursor: "pointer" }} />
        </div>
        <div className="xts-mobile-nav">
          {navLinks.map((link) => (
            <div key={link.label}>
              {link.hasDropdown ? (
                <>
                  <div 
                    className="xts-mobile-nav-link xts-has-children"
                    onClick={() => {
                      if (link.label === "Our Partners") setMobilePartnersOpen(!mobilePartnersOpen);
                      if (link.label === "Products") setMobileCategoriesOpen(!mobileCategoriesOpen);
                    }}
                  >
                    {link.label}
                    <ChevronDown size={18} className={cn("xts-mobile-arrow", 
                      (link.label === "Our Partners" && mobilePartnersOpen) ||
                      (link.label === "Products" && mobileCategoriesOpen) ? "xts-opened" : ""
                    )} />
                  </div>
                  
                  {link.label === "Our Partners" && (
                    <div className={cn("xts-mobile-sub-menu", mobilePartnersOpen && "xts-opened")}>
                      {partners.map((partner) => (
                        <Link
                          key={partner.id}
                          to={`/our-partners#${partner.partner_details.brand_id || partner.partner_details.brand_name.toLowerCase().replace(/\s+/g, '-')}`}
                          className="xts-mobile-sub-menu-link"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {decodeHtmlEntities(partner.partner_details.brand_name)}
                        </Link>
                      ))}
                    </div>
                  )}

                  {link.label === "Products" && (
                    <div className={cn("xts-mobile-sub-menu", mobileCategoriesOpen && "xts-opened")}>
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/products?category=${category.id}`}
                          className="xts-mobile-sub-menu-link"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {decodeHtmlEntities(category.name)}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={link.href}
                  className="xts-mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Header;
