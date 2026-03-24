import { Link } from "react-router-dom";
import LazyImage from "./ui/LazyImage";

interface ProductCardProps {
  name: string;
  image: string;
  slug: string;
  brand?: string;
}

const ProductCard = ({ name, image, slug, brand }: ProductCardProps) => {

  return (
    <div className="group">
      <Link to={`/product/${slug}`} className="block">
        <div className="relative aspect-square bg-white border border-black/5 rounded-sm overflow-hidden flex items-center justify-center transition-colors">
          <LazyImage
            src={image}
            alt={name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
            containerClassName="w-full h-full flex items-center justify-center p-8"
          />
        </div>
        <div className="mt-4 text-center px-2">
          {brand && (
            <span className="block text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60 font-medium mb-1.5">
              {brand}
            </span>
          )}
          <h3 style={{ fontFamily: 'Montserrat' }} className="text-[14px] font-bold text-[#2d2d2d] leading-tight group-hover:text-[#CD2727] transition-colors" dangerouslySetInnerHTML={{ __html: name }} />
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
