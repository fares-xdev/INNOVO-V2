import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";

import { fetchProjectBySlug, getOriginalImage, decodeHtmlEntities } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import LazyImage from "@/components/ui/LazyImage";

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", slug],
    queryFn: () => fetchProjectBySlug(slug || ""),
    enabled: !!slug,
  });

  // Helper to extract YouTube URL from shortcodes or content
  const extractVideoUrl = (content: string) => {
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
    const match = content.match(ytRegex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  // Helper to extract gallery images from the Woodmart HTML with highest quality
  const extractGalleryImages = (content: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    
    // First, look for links that point directly to images (often high-res modal links)
    const galleryLinks = Array.from(doc.querySelectorAll(".woodmart-gallery-item a, .gallery-item a, .wp-block-image a, a[href$='.jpg'], a[href$='.jpeg'], a[href$='.png'], a[href$='.webp']"));
    const linkSources = galleryLinks
      .map(a => (a as HTMLAnchorElement).href)
      .filter(href => href && href.match(/\.(jpg|jpeg|png|gif|webp)$/i));

    if (linkSources.length > 0) {
      // Use unique sources to avoid duplicates from links and imgs
      const uniqueSources = Array.from(new Set(linkSources));
      return uniqueSources.map(src => getOriginalImage(src));
    }

    const imgs = Array.from(doc.querySelectorAll(".woodmart-gallery-item img, img.woodmart-gallery-image, .wp-block-image img, .gallery-item img"));
    
    return imgs.map(img => {
      const el = img as HTMLImageElement;
      
      // Try high-res attributes first
      const highRes = el.getAttribute('data-large_image') || el.getAttribute('data-wood-src') || el.getAttribute('data-lazy-src') || el.getAttribute('data-src');
      if (highRes) return getOriginalImage(highRes);

      // Check srcset for hints
      const srcset = el.getAttribute('srcset');
      if (srcset) {
        const sources = srcset.split(',').map(s => s.trim().split(/\s+/));
        const largest = sources.sort((a, b) => {
          const valA = parseInt(a[1]) || 0;
          const valB = parseInt(b[1]) || 0;
          return valB - valA;
        })[0];
        if (largest) return getOriginalImage(largest[0]);
      }

      return getOriginalImage(el.src);
    }).filter(src => src && !src.includes("placeholder"));
  };

  // Helper to extract Client/Year table info
  const extractProjectInfo = (content: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const rows = Array.from(doc.querySelectorAll("table tr"));
    return rows.map(row => {
      const label = row.querySelector("th")?.textContent || "";
      const value = row.querySelector("td")?.textContent || "";
      return { label, value };
    }).filter(item => item.label && item.value);
  };

  // Extract data only if project exists
  const videoUrl = project ? extractVideoUrl(project.content.rendered) : null;
  const gallery = project ? extractGalleryImages(project.content.rendered) : [];
  const projectInfo = project ? extractProjectInfo(project.content.rendered) : [];
  
  const media = project?._embedded?.["wp:featuredmedia"]?.[0];
  const featuredImage = getOriginalImage(media?.media_details?.sizes?.full?.source_url || media?.source_url);

  const navigateLightbox = useCallback((direction: 'prev' | 'next') => {
    if (selectedImageIndex === null || gallery.length === 0) return;
    if (direction === 'prev') {
      setSelectedImageIndex(prev => (prev! > 0 ? prev! - 1 : gallery.length - 1));
    } else {
      setSelectedImageIndex(prev => (prev! < gallery.length - 1 ? prev! + 1 : 0));
    }
  }, [selectedImageIndex, gallery.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === "Escape") setSelectedImageIndex(null);
      if (e.key === "ArrowLeft") navigateLightbox('prev');
      if (e.key === "ArrowRight") navigateLightbox('next');
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, gallery.length, navigateLightbox]);

  if (isLoading) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="bg-[#F9F9F9] flex-1">
        <section className="py-10 text-center container">
          <div className="h-10 w-2/3 bg-black/5 animate-pulse mx-auto rounded-lg mb-3" />
        </section>
        <section className="w-full max-w-6xl mx-auto px-4 md:px-6 mb-12">
          <div className="w-full aspect-video md:aspect-[21/9] bg-black/5 animate-pulse rounded-xl" />
        </section>
        <section className="w-full max-w-6xl mx-auto px-4 md:px-6 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-[16/9] md:aspect-square bg-black/5 animate-pulse rounded-lg" />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );

  if (error || !project) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center text-red-500 font-bold p-10 text-center">
        <div>
          <h2 className="text-2xl mb-4">Project not found</h2>
          <Link to="/projects" className="text-primary hover:underline uppercase text-sm font-bold tracking-widest">Back to projects</Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="bg-[#F9F9F9] flex-1">
        {/* Specialized Project Detail Hero */}
        <section className="project-detail-hero">
          <h1 
            className="project-detail-hero-title"
            dangerouslySetInnerHTML={{ __html: project!.title.rendered }}
          />
        </section>

        {/* Hero Media Section (Video or Featured Image) */}
        <section className={`w-full mx-auto px-4 md:px-6 mb-6 ${videoUrl ? 'max-w-5xl' : 'max-w-6xl'}`}>
          {videoUrl ? (
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
              <iframe
                src={videoUrl}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : featuredImage && (
            <div className="w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden shadow-md">
              <LazyImage
                src={featuredImage} 
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" 
                alt={decodeHtmlEntities(project?.title.rendered)} 
                containerClassName="w-full h-full"
              />
            </div>
          )}
        </section>

        {/* Gallery Section */}
        <section className="w-full max-w-6xl mx-auto px-4 md:px-6 pb-20">
          {/* Gallery Grid */}
          {gallery.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 mb-16">
              {gallery.map((img, idx) => (
                <div 
                  key={idx} 
                  className="aspect-[16/9] md:aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer"
                  onClick={() => setSelectedImageIndex(idx)}
                >
                  <LazyImage
                    src={img} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={`Gallery ${idx + 1}`} 
                    containerClassName="w-full h-full"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="mt-20 pt-10 border-t flex justify-between items-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Link to="/projects" className="flex items-center gap-2 hover:text-foreground transition-colors group">
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Newer <span className="hidden md:inline">Project</span>
            </Link>
            <Link to="/projects" className="flex items-center gap-2 hover:text-foreground transition-colors group">
              Older <span className="hidden md:inline">Project</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />

      {/* Lightbox / Slider Modal */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center animate-in fade-in duration-300">
          <button 
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50 p-2"
          >
            <X className="w-8 h-8" />
          </button>

          <button 
            onClick={() => navigateLightbox('prev')}
            className="absolute left-4 md:left-8 text-white/70 hover:text-white transition-colors z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button 
            onClick={() => navigateLightbox('next')}
            className="absolute right-4 md:right-8 text-white/70 hover:text-white transition-colors z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12" onClick={() => setSelectedImageIndex(null)}>
            <img 
              src={gallery[selectedImageIndex]} 
              className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-500" 
              alt=""
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="absolute bottom-6 left-0 right-0 text-center text-white/50 text-sm font-medium tracking-widest uppercase">
            {selectedImageIndex + 1} / {gallery.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
