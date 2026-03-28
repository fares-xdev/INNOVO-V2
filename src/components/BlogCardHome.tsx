import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Share2, MessageCircle, Mail } from "lucide-react";
import LazyImage from "./ui/LazyImage";

interface BlogCardHomeProps {
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
  slug?: string;
}

export function BlogCardHome({
  image,
  author,
  category,
  title,
  excerpt,
  commentsCount = 0,
  className = "",
  slug,
}: BlogCardHomeProps) {
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
  };

  return (
    <div
      className={`group flex flex-col bg-white overflow-hidden transition-all duration-300 h-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Thumbnail Area */}
      <div className="relative overflow-hidden aspect-[3/2] w-full">
        <Link to={`/blog/${slug}`} className="block w-full h-full">
          <LazyImage
            src={image}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isHovered ? "scale-110" : "scale-100"}`}
            containerClassName="w-full h-full"
          />
          
          {/* Hover Overlay "Continue Reading" */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none z-20">
            <div className={`bg-white text-black text-[11px] font-bold uppercase tracking-widest px-6 py-2.5 transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              Continue reading
            </div>
          </div>
        </Link>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-grow p-5">
        {/* Category */}
        <div className="mb-2">
          <Link 
            to={`/blog?category=${category}`}
            className="inline-block bg-[#2C2C2C] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-[7px] hover:bg-[#CD2727] transition-colors"
          >
            {category}
          </Link>
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-[22px] font-bold mb-2 leading-tight group-hover:text-[#CD2727] transition-colors line-clamp-2">
          <Link to={`/blog/${slug}`}>
            {title}
          </Link>
        </h3>

        {/* Description/Excerpt */}
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between">
          {/* Author */}
          <div className="flex items-center gap-2">
            <Link to={`/author/${author?.name}`} className="flex items-center gap-2 group/author">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 ring-2 ring-gray-50 transition-all group-hover/author:ring-[#CD2727]/20">
                {author?.avatar ? (
                  <img src={author.avatar} alt={authorName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-gray-800 group-hover/author:text-[#CD2727] transition-colors uppercase tracking-wider">{authorName}</span>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Share Menu */}
            <div className="relative group/share flex items-center">
              <button className="text-gray-400 hover:text-black transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              
              {/* Tooltip Share Icons */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-black text-white px-3 py-2 flex items-center gap-3 rounded shadow-xl opacity-0 invisible group-hover/share:opacity-100 group-hover/share:visible transition-all duration-300">
                <button onClick={(e) => handleShare(e, "email")} className="hover:text-[#CD2727] transition-colors"><Mail className="w-3.5 h-3.5" /></button>
                <button onClick={(e) => handleShare(e, "facebook")} className="hover:text-[#CD2727] transition-colors">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </button>
                <button onClick={(e) => handleShare(e, "twitter")} className="hover:text-[#CD2727] transition-colors">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </button>
                <button onClick={(e) => handleShare(e, "whatsapp")} className="hover:text-[#CD2727] transition-colors">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.6-27.4-16.4-14.7-27.5-32.8-30.7-38.4-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.6-6.1 8.4-9.2 2.8-3.1 3.7-5.3 5.5-8.9 1.9-3.6.9-6.7-.5-9.4-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                </button>
              </div>
            </div>

            {/* Comments */}
            <button 
              onClick={handleCommentClick}
              className="flex items-center gap-1.5 text-gray-400 hover:text-black transition-colors"
            >
              <span className="text-[11px] font-bold">{commentsCount}</span>
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
