import { ArrowRight, Share2, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { decodeHtmlEntities } from "@/lib/api";

interface ProjectCardProps {
  title: string;
  image: string;
  slug: string;
  delay?: number;
}

const ProjectCard = ({ title, image, slug, delay = 0 }: ProjectCardProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const projectUrl = `${window.location.origin}/project/${slug}`;
  const decodedTitle = decodeHtmlEntities(title);
  const encodedUrl = encodeURIComponent(projectUrl);
  const encodedTitle = encodeURIComponent(decodedTitle);

  const shareActions = {
    email: () => `mailto:?subject=${encodedTitle}&body=Check out this project: ${encodedUrl}`,
    facebook: () => `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: () => `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: () => `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleShare = (e: React.MouseEvent, type: keyof typeof shareActions) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(shareActions[type](), "_blank", "noopener,noreferrer");
  };

  return (
    <Link
      to={`/project/${slug}`}
      className="group relative block overflow-hidden rounded-xl"
      style={{
        animation: `fadeInUp 0.6s ease-out ${delay}ms both`,
      }}
    >
      <div className="aspect-[16/9] overflow-hidden relative">
        {!isLoaded && (
          <Skeleton className="absolute inset-0 w-full h-full z-10" />
        )}
        <img
          src={image}
          alt={decodedTitle}
          className={`h-full w-full object-cover transition-all duration-700 ease-out ${
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          } group-hover:scale-105`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90" />

      {/* Share button & popup */}
      <div className="group/share absolute top-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-3 rounded-xl bg-black px-4 py-2.5 transition-all duration-300 origin-right scale-x-0 opacity-0 group-hover/share:scale-x-100 group-hover/share:opacity-100">
          <button
            className="flex items-center justify-center text-white/80 transition-colors hover:text-white"
            onClick={(e) => handleShare(e, "email")}
          >
            <Mail className="h-4 w-4" />
          </button>
          <button
            className="flex items-center justify-center text-white/80 transition-colors hover:text-white"
            onClick={(e) => handleShare(e, "facebook")}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </button>
          <button
            className="flex items-center justify-center text-white/80 transition-colors hover:text-white"
            onClick={(e) => handleShare(e, "twitter")}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </button>
          <button
            className="flex items-center justify-center text-white/80 transition-colors hover:text-white"
            onClick={(e) => handleShare(e, "whatsapp")}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 448 512">
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.6-27.4-16.4-14.7-27.5-32.8-30.7-38.4-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.6-6.1 8.4-9.2 2.8-3.1 3.7-5.3 5.5-8.9 1.9-3.6.9-6.7-.5-9.4-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
            </svg>
          </button>
        </div>
        <span className="relative z-10 text-primary-foreground/50 transition-colors hover:text-primary-foreground cursor-pointer">
          <Share2 className="h-5 w-5" />
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5">
        <h3 className="text-lg font-semibold text-primary-foreground transition-transform duration-300 group-hover:translate-x-1">
          {decodedTitle}
        </h3>
        <span className="flex h-8 w-8 items-center justify-center text-primary-foreground opacity-0 transition-all duration-300 group-hover:opacity-100">
          <ArrowRight className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
};

export default ProjectCard;
