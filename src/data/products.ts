import productArc from "@/assets/product-arc.png";
import productOasi from "@/assets/product-oasi.png";
import productAngle from "@/assets/product-angle.png";
import productShush from "@/assets/product-shush.png";
import productCloud from "@/assets/product-cloud.png";
import productManagerial from "@/assets/product-managerial.png";
import productFebe from "@/assets/product-febe.png";
import productLego from "@/assets/product-lego.png";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  image: string;
  images: string[];
  description: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Arc",
    slug: "arc",
    category: "Lounges",
    image: productArc,
    images: [productArc],
    description:
      "U.noia's sofas break away from the traditional, bringing bold character and fresh energy to any workspace.\n\nWith fully customizable textiles, colors, and materials, each piece can be tailored to match a brand's identity, making every space feel uniquely its own.\n\nWhether it's for a casual meeting spot or a statement lounge area, U.noia's sofas are made to stand out while fitting right in.",
  },
  {
    id: "2",
    name: "Oasi",
    slug: "oasi",
    category: "Tables",
    image: productOasi,
    images: [productOasi],
    description:
      "The Oasi table collection brings a sense of calm and elegance to modern workspaces. With its clean pedestal base and smooth surface, it's designed for collaborative spaces, cafeterias, and reception areas.\n\nAvailable in various sizes and finishes to complement any interior.",
  },
  {
    id: "3",
    name: "Angle",
    slug: "angle",
    category: "Desks",
    image: productAngle,
    images: [productAngle],
    description:
      "The Angle executive desk combines premium wood finishes with bold geometric metal legs. Designed for leaders who value both form and function.\n\nFeatures integrated cable management and customizable surface materials.",
  },
  {
    id: "4",
    name: "Shush",
    slug: "shush",
    category: "Acoustics",
    image: productShush,
    images: [productShush],
    description:
      "Shush acoustic panels transform open spaces into focused work environments. Made from premium felt with artistic cut-out patterns, they reduce noise while adding a bold design statement.\n\nAvailable in a range of colors and patterns.",
  },
  {
    id: "5",
    name: "Cloud",
    slug: "cloud",
    category: "Lounges",
    image: productCloud,
    images: [productCloud],
    description:
      "The Cloud sofa series offers deep comfort with a refined aesthetic. Premium leather upholstery meets a sleek metal frame for a piece that elevates any lounge or waiting area.\n\nCustomizable in various leather colors and frame finishes.",
  },
  {
    id: "6",
    name: "Managerial",
    slug: "managerial",
    category: "Desks",
    image: productManagerial,
    images: [productManagerial],
    description:
      "A minimalist desk designed for the modern manager. Clean lines and a light footprint make it perfect for contemporary offices that prioritize simplicity and functionality.",
  },
  {
    id: "7",
    name: "Febe",
    slug: "febe",
    category: "Chairs",
    image: productFebe,
    images: [productFebe],
    description:
      "The Febe task chair combines ergonomic support with sophisticated design. Upholstered in premium fabrics with a smooth swivel base, it brings comfort and style to every workspace.",
  },
  {
    id: "8",
    name: "Lego",
    slug: "lego",
    category: "Lounges",
    image: productLego,
    images: [productLego],
    description:
      "The Lego modular sofa system lets you build your perfect seating arrangement. Individual units connect seamlessly, making it easy to reconfigure layouts as needs change.\n\nIdeal for dynamic workspaces and collaborative areas.",
  },
];
