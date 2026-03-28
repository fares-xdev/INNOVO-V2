import { useQuery } from "@tanstack/react-query";
import { fetchSocialLinks } from "@/lib/api";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Minus, Mail, Phone, MapPin } from "lucide-react";

// Helper to get Icon component based on slug/name
const SocialIcon = ({ type, className }: { type: string; className?: string }) => {
  switch (type.toLowerCase()) {
    case 'facebook': return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/>
      </svg>
    );
    case 'instagram': return <Instagram className={className} />;
    case 'linkedin': return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
      </svg>
    );
    case 'twitter': return <Twitter className={className} />;
    case 'youtube': return <Youtube className={className} />;
    case 'behance': return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12h2a3 3 0 0 0 0-6H9v6zM9 12v6h3a3 3 0 0 0 0-6H9z" />
        <path d="M18 11.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
        <path d="M16 11.5A2.5 2.5 0 1 1 21 11.5" />
        <line x1="16" y1="8.5" x2="20" y2="8.5" />
      </svg>
    );
    default: return <Minus className={className} />;
  }
};

const Footer = () => {
  const links = ["Home", "Products", "Projects", "About us", "Blog", "Contact us"];

  const { data: socialLinks = [] } = useQuery({
    queryKey: ["social-links"],
    queryFn: fetchSocialLinks,
  });

  return (
    <footer className="bg-white pt-6 pb-3 border-t border-border">
      <div className="container flex flex-col items-center gap-10">
        {/* Social Links Section */}
        {socialLinks.length > 0 && (
          <div className="flex items-center gap-6">
            {socialLinks.map((social: any) => (
              <a 
                key={social.id}
                href={social.social_details?.url || "#"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-foreground transition-colors group"
                title={social.title?.rendered}
              >
                <SocialIcon 
                  type={social.social_details?.icon || "minus"} 
                  className="w-6 h-6 transition-transform" 
                />
              </a>
            ))}
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex flex-wrap items-center justify-center gap-2">
          {links.map((link, i) => (
            <span key={link} className="flex items-center gap-2">
              <a
                href={link === "Home" ? "/" : `/${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-muted-foreground hover:text-foreground transition-colors text-base font-medium"
              >
                {link}
              </a>
              {i < links.length - 1 && (
                <span className="text-border">|</span>
              )}
            </span>
          ))}
        </nav>

        {/* Copyright Section */}
        <div className="mt-3 text-center">
          <p className="text-xs md:text-sm text-muted-foreground font-light ">
            <span className="text-[#333] font-black">Innovo</span> © 2025 CREATED BY <a href="https://movico-eg.com/" target="_blank" rel="noopener noreferrer" className="text-[#333] font-black hover:text-black transition-colors">Movico</a>. PREMIUM WEB SOLUTIONS.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
