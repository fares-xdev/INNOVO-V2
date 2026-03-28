import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Share2, MessageCircle, Mail } from "lucide-react";
import LazyImage from "./ui/LazyImage";

interface BlogCardProps {
  image: string;
  author?: {
    name: string;
    avatar: string;
  };
  category: string;
  title: string;
  excerpt: string;
  commentsCount?: number;
  className?: string;
  size?: "normal" | "tall" | "compact" | "medium";
  id?: number | string;
  slug?: string;
}

export function BlogCard({
  image,
  author,
  category,
  title,
  excerpt,
  commentsCount = 0,
  className = "",
  size = "normal",
  slug,
}: BlogCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const authorName = author?.name || "asoudy";
  const postUrl = `${window.location.origin}/blog/${slug}`;
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareActions = {
    email: () => `mailto:?subject=${encodedTitle}&body=Check out this post: ${encodedUrl}`,
    facebook: () => `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: () => `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: () => `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleShare = (e: React.MouseEvent, type: keyof typeof shareActions) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(shareActions[type](), "_blank", "noopener,noreferrer");
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/blog/${slug}#comments`);
    // After navigation, we might need a small delay and scroll if on same page
    if (window.location.pathname === `/blog/${slug}`) {
      const element = document.getElementById('comments');
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Link
      to={`/blog/${slug || title.toLowerCase().replace(/\s+/g, '-')}`}
      className={`group relative block overflow-hidden rounded-lg bg-background ${
        size === "tall" ? "lg:row-span-2 h-full" : "h-full"
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Wrapper */}
      <div className={`relative w-full overflow-hidden ${
        size === "tall" ? "h-full min-h-[700px]" : 
        size === "medium" ? "h-[500px]" :
        size === "compact" ? "h-[400px]" : "h-[600px]"
      }`}>
        <LazyImage
          src={image}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isHovered ? "scale-110" : "scale-100"}`}
          containerClassName="w-full h-full"
        />
        
        {/* Gradient Overlay - Darker for better text readability */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Bar - Author and Actions */}
        <div className="absolute top-0 left-0 right-0 p-5 flex items-center justify-between z-10">
          {/* Author */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md overflow-hidden flex items-center justify-center border border-white/30">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <span className="text-white text-sm font-medium">{authorName}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Share Group */}
            <div className="group/share relative flex items-center">
              {/* Share popup - appears on hover */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 transition-all duration-300 origin-right scale-x-0 opacity-0 group-hover/share:scale-x-100 group-hover/share:opacity-100">
                <button
                  className="flex items-center justify-center text-white/80 transition-colors hover:text-white"
                  onClick={(e) => handleShare(e, "email")}
                  title="Share via Email"
                >
                  <Mail className="h-4 w-4" />
                </button>
                <button
                  className="flex items-center justify-center text-white/80 transition-colors hover:text-white"
                  onClick={(e) => handleShare(e, "facebook")}
                  title="Share on Facebook"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </button>
                <button
                  className="flex items-center justify-center text-white/80 transition-colors hover:text-white"
                  onClick={(e) => handleShare(e, "twitter")}
                  title="Share on Twitter"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </button>
                <button
                  className="flex items-center justify-center text-white/80 transition-colors hover:text-white"
                  onClick={(e) => handleShare(e, "whatsapp")}
                  title="Share on WhatsApp"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 448 512">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.6-27.4-16.4-14.7-27.5-32.8-30.7-38.4-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.6-6.1 8.4-9.2 2.8-3.1 3.7-5.3 5.5-8.9 1.9-3.6.9-6.7-.5-9.4-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                  </svg>
                </button>
              </div>
              
              <button className="text-white/80 hover:text-white transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={handleCommentClick}
              className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{commentsCount}</span>
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          {/* Category Tag */}
          <span className="inline-block px-4 py-1.5 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-sm mb-4">
            {category}
          </span>

          {/* Title */}
          <h3 className="text-white text-xl md:text-[22px] font-bold mb-3 line-clamp-2 leading-[1.2] drop-shadow-md">
            {title}
          </h3>

          {/* Excerpt */}
          <p className="text-white/80 text-[13px] line-clamp-2 leading-snug">
            {excerpt}
          </p>
        </div>
      </div>
    </Link>
  );
}

