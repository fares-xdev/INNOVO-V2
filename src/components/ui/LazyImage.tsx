import React, { useState } from "react";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  skeletonClassName?: string;
}

const LazyImage = ({ 
  src, 
  alt, 
  className, 
  containerClassName, 
  skeletonClassName,
  ...props 
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {!isLoaded && (
        <Skeleton className={cn("absolute inset-0 w-full h-full z-10", skeletonClassName)} />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-700 ease-out",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
};

export default LazyImage;
