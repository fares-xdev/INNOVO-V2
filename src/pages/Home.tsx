import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ChevronUp, Eye, Heart, Target, Shield, Star, Loader2, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import ProductCard from "@/components/ProductCard";
import ProjectCard from "@/components/ProjectCard";
import { BlogCardHome } from "@/components/BlogCardHome";
import LazyImage from "@/components/ui/LazyImage";
import { 
  fetchProducts, 
  fetchProductCategories, 
  Product, 
  Term, 
  BRAND_ATTR_ID, 
  getOriginalImage, 
  fetchCustomers,
  fetchPartnersSlider,
  fetchHeroSlides,
  fetchHomeCategories,
  fetchHomeVideo,
  fetchProjects,
  fetchPosts,
  decodeHtmlEntities,
  cleanWordPressContent
} from "@/lib/api";

interface EmbeddedMedia {
  'wp:featuredmedia'?: Array<{
    source_url: string;
    media_details?: {
      sizes?: {
        medium?: { source_url: string };
        full?: { source_url: string };
        large?: { source_url: string };
      };
    };
  }>;
  'wp:term'?: Array<Array<{
    id: number;
    name: string;
    slug: string;
    taxonomy: string;
  }>>;
  'author'?: Array<{
    name: string;
    avatar_urls?: {
      [key: string]: string;
    };
  }>;
}

interface HomeProject {
  id: number;
  title: { rendered: string };
  slug: string;
  _embedded?: EmbeddedMedia;
}

interface HomePost {
  id: number;
  title: { rendered: string };
  slug: string;
  excerpt: { rendered: string };
  date: string;
  _embedded?: EmbeddedMedia;
}





import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface Partner {
  id: number;
  name: string;
  logo: string;
}

interface HeroSlide {
  image: string;
  title: string;
  description: string;
}

const pillars = [
  { icon: Eye, label: "Attention to details" },
  { icon: Heart, label: "Comfort" },
  { icon: Shield, label: "Responsibility" },
  { icon: Target, label: "Human-Centric" },
  { icon: Star, label: "Excellence" },
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlideIndex, setPrevSlideIndex] = useState<number | null>(null);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Term[]>([]);
  const [homeCategories, setHomeCategories] = useState<{
    id: number;
    category_details: Term;
    custom_image: string;
  }[]>([]);
  const [homeVideo, setHomeVideo] = useState<{
    id: number;
    title: { rendered: string };
    video_details: {
      subtitle: string;
      description: string;
      video_url: string;
      btn_text: string;
      btn_link: string;
    }
  } | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [projects, setProjects] = useState<HomeProject[]>([]);
  const [posts, setPosts] = useState<HomePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Partners Slider State
  const [partnersSlider, setPartnersSlider] = useState<Partner[]>([]);
  const [sliderApi, setSliderApi] = useState<CarouselApi>();
  const [sliderCurrent, setSliderCurrent] = useState(0);
  const [sliderCount, setSliderCount] = useState(0);

  // Category Slider State
  const [categoryApi, setCategoryApi] = useState<CarouselApi>();
  const [categoryCurrent, setCategoryCurrent] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [categoryScrollSnaps, setCategoryScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  // Portfolio Slider State
  const [portfolioApi, setPortfolioApi] = useState<CarouselApi>();
  const [portfolioCurrent, setPortfolioCurrent] = useState(0);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [portfolioScrollSnaps, setPortfolioScrollSnaps] = useState<number[]>([]);
  const [canScrollPrevPortfolio, setCanScrollPrevPortfolio] = useState(false);
  const [canScrollNextPortfolio, setCanScrollNextPortfolio] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      setIsLoading(true);
      try {
        const [
          productsData, 
          categoriesData, 
          customersResponse, 
          partnersSliderResponse, 
          heroResponse, 
          homeCategoriesResponse, 
          homeVideoResponse, 
          projectsResponse, 
          postsResponse
        ] = await Promise.all([
          fetchProducts({ per_page: 8 }).catch(e => ({ data: [] })),
          fetchProductCategories().catch(e => []),
          fetchCustomers().catch(e => []),
          fetchPartnersSlider().catch(e => []),
          fetchHeroSlides().catch(e => []),
          fetchHomeCategories().catch(e => []),
          fetchHomeVideo().catch(e => []),
          fetchProjects(1, 8).catch(e => ({ data: [] })),
          fetchPosts(1, 3).catch(e => ({ data: [] }))
        ]);
        setFeaturedProducts(productsData.data);
        setCategories(categoriesData);
        setHomeCategories(homeCategoriesResponse);
        
        if (Array.isArray(homeVideoResponse) && homeVideoResponse.length > 0) {
          setHomeVideo(homeVideoResponse[0]);
        }
        
        if (projectsResponse && Array.isArray(projectsResponse.data)) {
          setProjects(projectsResponse.data);
        }
        
        if (postsResponse && Array.isArray(postsResponse.data)) {
          setPosts(postsResponse.data);
        }

        // Process Hero Slides
        if (Array.isArray(heroResponse) && heroResponse.length > 0) {
          const dynamicSlides = heroResponse.map((s: { 
            _embedded?: { 'wp:featuredmedia'?: Array<{ source_url: string }> },
            title?: { rendered: string },
            hero_details?: { description: string, slide_order?: number }
          }) => ({
            image: getOriginalImage(s._embedded?.['wp:featuredmedia']?.[0]?.source_url) || "",
            title: s.title?.rendered || "",
            description: s.hero_details?.description || "",
            order: s.hero_details?.slide_order || 0,
          }))
          .sort((a, b: any) => a.order - b.order);
          
          setSlides(dynamicSlides);
        } else {
          setSlides([]);
        }

        // Process Customers
        if (Array.isArray(customersResponse) && customersResponse.length > 0) {
          const finalPartners = customersResponse.flatMap((c: { logos_gallery?: Array<{ id: number, title: string, url: string }> }) => 
            (c.logos_gallery || []).map((img) => ({
              id: img.id,
              name: img.title,
              logo: getOriginalImage(img.url)
            }))
          ).filter(p => p.logo);
          
          if (finalPartners.length > 0) {
            setPartners([...finalPartners, ...finalPartners]);
          }
        }

        // Process Partners Slider
        if (Array.isArray(partnersSliderResponse) && partnersSliderResponse.length > 0) {
          const finalPartnersSlider = partnersSliderResponse.flatMap((c: { logos_gallery?: Array<{ id: number, title: string, url: string }> }) => 
            (c.logos_gallery || []).map((img) => ({
              id: img.id,
              name: img.title,
              logo: getOriginalImage(img.url)
            }))
          ).filter(p => p.logo);
          
          if (finalPartnersSlider.length > 0) {
            setPartnersSlider([...finalPartnersSlider, ...finalPartnersSlider]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch home data", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHomeData();
  }, []);

  useEffect(() => {
    if (!api || partners.length === 0) return;
    setCount(partners.length / 2); // 15 unique if 30 total
    setCurrent(api.selectedScrollSnap() % (partners.length / 2));

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() % (partners.length / 2));
    });
  }, [api, partners]);

  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [api]);

  useEffect(() => {
    if (!sliderApi || partnersSlider.length === 0) return;
    setSliderCount(partnersSlider.length / 2);
    setSliderCurrent(sliderApi.selectedScrollSnap() % (partnersSlider.length / 2));

    sliderApi.on("select", () => {
      setSliderCurrent(sliderApi.selectedScrollSnap() % (partnersSlider.length / 2));
    });
  }, [sliderApi, partnersSlider]);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    const oldSlide = currentSlide;
    setPrevSlideIndex(oldSlide);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    
    // Clear the previous slide index after the transition (1s) finishes
    setTimeout(() => {
      setPrevSlideIndex(null);
    }, 1500);
  }, [slides.length, currentSlide]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    const oldSlide = currentSlide;
    setPrevSlideIndex(oldSlide);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    // Clear the previous slide index after the transition (1s) finishes
    setTimeout(() => {
      setPrevSlideIndex(null);
    }, 1500);
  }, [slides.length, currentSlide]);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  useEffect(() => {
    if (!categoryApi || homeCategories.length === 0) return;
    setCategoryCount(homeCategories.length);
    setCategoryScrollSnaps(categoryApi.scrollSnapList());
    setCategoryCurrent(categoryApi.selectedScrollSnap());
    setCanScrollPrev(categoryApi.canScrollPrev());
    setCanScrollNext(categoryApi.canScrollNext());

    categoryApi.on("select", () => {
      setCategoryCurrent(categoryApi.selectedScrollSnap());
      setCanScrollPrev(categoryApi.canScrollPrev());
      setCanScrollNext(categoryApi.canScrollNext());
    });
  }, [categoryApi, homeCategories]);

  useEffect(() => {
    if (!portfolioApi || projects.length === 0) return;
    setPortfolioCount(portfolioApi.scrollSnapList().length);
    setPortfolioCurrent(portfolioApi.selectedScrollSnap());
    setPortfolioScrollSnaps(portfolioApi.scrollSnapList());
    setCanScrollPrevPortfolio(portfolioApi.canScrollPrev());
    setCanScrollNextPortfolio(portfolioApi.canScrollNext());

    portfolioApi.on("select", () => {
      setPortfolioCurrent(portfolioApi.selectedScrollSnap());
      setCanScrollPrevPortfolio(portfolioApi.canScrollPrev());
      setCanScrollNextPortfolio(portfolioApi.canScrollNext());
    });
  }, [portfolioApi, projects]);

  const onPortfolioPrev = useCallback(() => portfolioApi?.scrollPrev(), [portfolioApi]);
  const onPortfolioNext = useCallback(() => portfolioApi?.scrollNext(), [portfolioApi]);

  useEffect(() => {
    if (!sliderApi || partnersSlider.length === 0) return;
    const interval = setInterval(() => {
      sliderApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [sliderApi, partnersSlider]);

  useEffect(() => {
    if (!categoryApi || homeCategories.length === 0) return;
    const interval = setInterval(() => {
      categoryApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [categoryApi, homeCategories]);

  useEffect(() => {
    if (!portfolioApi || projects.length === 0) return;
    const interval = setInterval(() => {
      portfolioApi.scrollNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [portfolioApi, projects]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Slider */}
      {isLoading ? (
        <section className="h-[600px] md:h-screen w-full bg-black/5 animate-pulse flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary/20" />
        </section>
      ) : (
        <section className="relative h-[600px] md:h-screen overflow-hidden group">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide 
                  ? "opacity-100" 
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="absolute inset-0 bg-black/30 z-10" />
              <img
                src={slide.image}
                alt={slide.title}
                className={`absolute inset-0 w-full h-full object-cover ${
                  index === currentSlide || index === prevSlideIndex 
                  ? "animate-ken-burns" 
                  : ""
                }`}
              />
              <div className="relative z-20 h-full flex flex-col items-center justify-center text-center text-white px-4 md:px-0 cursor-default select-none">
                <h1 
                  className="hero-heading !text-white max-w-4xl mb-6 shadow-sm drop-shadow-lg"
                  dangerouslySetInnerHTML={{ __html: slide.title }}
                />
                <div className="max-w-2xl">
                  <p 
                    className="hero-description"
                    dangerouslySetInnerHTML={{ __html: slide.description }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-white/30 text-white transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-white hover:text-black"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-white/30 text-white transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-white hover:text-black"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </section>
      )}

      {/* Our Customers */}
      {(isLoading || partners.length > 0) && (
        <section className="home-section home-section-white">
          <div className="container">
            <div className="section-header">
              <h2 className="section-heading mb-4 tracking-wide max-w-[90%] lg:max-w-2xl mx-auto">
                Our Customers
              </h2>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-24 bg-black/5 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="relative px-12">
                <Carousel
                  setApi={setApi}
                  opts={{
                    align: "center",
                    loop: true,
                    duration: 40,
                    skipSnaps: false,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="">
                    {partners.map((partner, index) => {
                      const logoUrl = partner.logo;
                      const isActive = index % (partners.length / 2) === current;

                      if (!logoUrl) return null;

                      return (
                        <CarouselItem 
                          key={`${partner.id}-${index}`} 
                          className="basis-1/2 md:basis-1/5 transition-all duration-500 flex items-center justify-center h-[160px]"
                        >
                          <div className={`transition-all duration-700 h-full w-full flex items-center justify-center p-2 ${
                            isActive 
                              ? "scale-110 opacity-100 grayscale-0" 
                              : "scale-90 opacity-40 grayscale"
                          }`}>
                            <img
                              src={logoUrl}
                              alt={partner.name || "Customer"}
                              className="max-h-[80px] w-auto max-w-[80%] object-contain"
                            />
                          </div>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  <CarouselPrevious className="-left-16 border border-black/10 bg-white hover:bg-black hover:text-white h-12 w-12 [&>svg]:w-5 [&>svg]:h-5" />
                  <CarouselNext className="-right-16 border border-black/10 bg-white hover:bg-black hover:text-white h-12 w-12 [&>svg]:w-5 [&>svg]:h-5" />
                </Carousel>
                
                {/* Dots */}
                <div className="dots-container">
                  {Array.from({ length: count }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => api?.scrollTo(index)}
                      className={`dot ${index === current ? "dot-active" : ""}`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}


      {/* Full Width Video Section */}
      <section className="w-full relative h-[400px] md:h-[600px] lg:h-[750px] overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
          poster="https://innovo6.itreasure-eg.com/wp-content/uploads/2020/12/Interstuhl-HUB-Individualisation-english.mp4_snapshot_00.05_2020.12.12_12.14.30.jpg"
        >
          <source src="https://innovo-eg.com/wp-content/uploads/2020/12/Interstuhl-HUB-Individualisation-english.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Optional Overlay to make it feel premium */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </section>

      {/* Dynamic Video Section */}
      {homeVideo && (
        <section className="home-section home-section-white overflow-hidden">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-[1px] bg-red-600" />
                  <span className="text-red-600 font-bold tracking-[0.2em] text-sm uppercase">
                    {homeVideo.video_details?.subtitle || "MAKING MASTERPIECES"}
                  </span>
                </div>
                <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-black leading-tight">
                  {homeVideo.title?.rendered || "Watch how we bring life to spaces"}
                </h2>
                <p className="text-xl text-black/70 leading-relaxed max-w-lg">
                  {homeVideo.video_details?.description || "A behind-the-scenes look at our process and the passion we put into every masterpiece."}
                </p>
                <div className="pt-4">
                  <Link 
                    to={homeVideo.video_details?.btn_link || "/projects"} 
                    className="inline-flex items-center gap-2 text-black font-bold group border-b-2 border-black pb-1 hover:text-red-600 hover:border-red-600 transition-all duration-300"
                  >
                    {homeVideo.video_details?.btn_text || "EXPLORE ALL PROJECTS"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] group">
                <iframe
                  src={homeVideo.video_details?.video_url || "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&controls=1&rel=0"}
                  title="Project Video"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Our Partners Slider */}
      {(isLoading || partnersSlider.length > 0) && (
        <section className="home-section home-section-white">
          <div className="container">
            <div className="section-header">
              <h2 className="section-heading mb-4 tracking-wide max-w-[90%] lg:max-w-2xl mx-auto">
                Our Partners
              </h2>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 bg-black/5 animate-pulse rounded-md" />
                ))}
              </div>
            ) : (
              <div className="relative px-12">
                <Carousel
                  setApi={setSliderApi}
                  opts={{
                    align: "center",
                    loop: true,
                    duration: 40,
                    skipSnaps: false,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="">
                    {partnersSlider.map((partner, index) => {
                      const logoUrl = partner.logo;
                      const isActive = index % (partnersSlider.length / 2) === sliderCurrent;

                      if (!logoUrl) return null;

                      return (
                        <CarouselItem 
                          key={`${partner.id}-${index}`} 
                          className="basis-1/2 md:basis-1/5 transition-all duration-500 flex items-center justify-center h-[160px]"
                        >
                          <div className={`transition-all duration-700 h-full w-full flex items-center justify-center p-2 ${
                            isActive 
                              ? "scale-110 opacity-100 grayscale-0" 
                              : "scale-90 opacity-40 grayscale"
                          }`}>
                            <img
                              src={logoUrl}
                              alt={partner.name || "Partner"}
                              className="max-h-[80px] w-auto max-w-[80%] object-contain"
                            />
                          </div>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  <CarouselPrevious className="-left-16 border border-black/10 bg-white hover:bg-black hover:text-white h-12 w-12 [&>svg]:w-5 [&>svg]:h-5" />
                  <CarouselNext className="-right-16 border border-black/10 bg-white hover:bg-black hover:text-white h-12 w-12 [&>svg]:w-5 [&>svg]:h-5" />
                </Carousel>
                
                {/* Dots */}
                <div className="dots-container">
                  {Array.from({ length: sliderCount }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => sliderApi?.scrollTo(index)}
                      className={`dot ${index === sliderCurrent ? "dot-active" : ""}`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories 3D Slider */}
      {(isLoading || homeCategories.length > 0) && (
        <section className="home-section home-section-white">
          <div className="container">
            <div className="section-header">
              <h2 className="section-heading mb-4 tracking-wide max-w-[90%] lg:max-w-2xl mx-auto">
                Categories
              </h2>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-64 bg-black/5 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="relative max-w-5xl mx-auto px-4 md:px-12">
                <Carousel
                  setApi={setCategoryApi}
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-4">
                    {homeCategories.map((item) => {
                      const cat = item.category_details;
                      const customImage = item.custom_image;
                      
                      if (!cat) return null;

                      return (
                        <CarouselItem key={item.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 pt-24 md:pt-32">
                          <Link to={`/products?category=${cat.id}`} className="block group">
                            <div className="bg-[#E5E5E5] rounded-2xl h-[160px] md:h-[200px] max-w-[280px] mx-auto relative flex flex-col items-center justify-end pb-6 md:pb-8 shadow-sm">
                              {/* 3D Pop-out Image */}
                              <div className="absolute -top-16 md:-top-24 left-1/2 -translate-x-1/2 w-[85%] md:w-[95%] h-[140px] md:h-[200px] flex items-center justify-center drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover:-translate-y-3 z-10">
                                <img 
                                  src={getOriginalImage(customImage) || "https://innovo-eg.com/wp-content/uploads/2020/09/Interstuhl-pure-is3-1-300x300.png"} 
                                  alt={cat.name}
                                  className="w-full h-full object-contain mix-blend-multiply"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://innovo-eg.com/wp-content/uploads/2020/09/Interstuhl-pure-is3-1-300x300.png";
                                  }}
                                />
                              </div>
                              <span className="text-white font-bold text-lg md:text-xl tracking-tight px-4 text-center leading-tight relative z-20">
                                {decodeHtmlEntities(cat.name)}
                              </span>
                            </div>
                          </Link>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  
                  {/* Unified Custom Arrows for Categories */}
                  <div className="hidden md:block">
                    <button 
                      onClick={() => categoryApi?.scrollPrev()}
                      className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-black/10 bg-white shadow-sm hover:bg-black hover:text-white transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => categoryApi?.scrollNext()}
                      className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-black/10 bg-white shadow-sm hover:bg-black hover:text-white transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </Carousel>

                {/* Dots */}
                <div className="dots-container mt-12">
                  {categoryScrollSnaps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => categoryApi?.scrollTo(index)}
                      className={`dot ${index === categoryCurrent ? "dot-active" : ""}`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Portfolio Slider Section */}
      {(isLoading || projects.length > 0) && (
        <section className="home-section home-section-alt">
          <div className="container">
            <div className="section-header relative">
              <h2 className="section-heading mb-4 tracking-wide max-w-[90%] lg:max-w-2xl mx-auto">
                Portfolio
              </h2>
              
              {!isLoading && (
                <div className="flex items-center justify-center lg:justify-end lg:absolute lg:right-0 lg:bottom-0 gap-3 mt-6 lg:mt-0">
                  <button 
                    onClick={onPortfolioPrev}
                    disabled={!canScrollPrevPortfolio}
                    className={`w-12 h-12 flex items-center justify-center rounded-full border border-black/10 transition-all ${
                      !canScrollPrevPortfolio ? "opacity-30 cursor-not-allowed" : "hover:bg-black hover:text-white"
                    }`}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={onPortfolioNext}
                    disabled={!canScrollNextPortfolio}
                    className={`w-12 h-12 flex items-center justify-center rounded-full border border-black/10 transition-all ${
                      !canScrollNextPortfolio ? "opacity-30 cursor-not-allowed" : "hover:bg-black hover:text-white"
                    }`}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] bg-black/5 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <Carousel
                setApi={setPortfolioApi}
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-3 pb-8">
                  {projects.map((project, index) => {
                    const media = project._embedded?.["wp:featuredmedia"]?.[0];
                    const featuredImage = getOriginalImage(media?.media_details?.sizes?.full?.source_url || media?.source_url);
                    return (
                      <CarouselItem key={project.id} className="pl-3 basis-[85%] md:basis-1/3">
                        <ProjectCard
                          title={project.title.rendered}
                          image={featuredImage}
                          slug={project.slug}
                          delay={index * 100}
                        />
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
              </Carousel>
            )}
            
            {/* Dots */}
            {!isLoading && (
              <div className="flex justify-center gap-2 mt-8">
                {portfolioScrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => portfolioApi?.scrollTo(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === portfolioCurrent 
                        ? "bg-primary w-8" 
                        : "bg-black/10 w-4 hover:bg-black/30"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Blog Cards Section */}
      {(isLoading || posts.length > 0) && (
        <section className=" pb-40 bg-[#F9F9F9] overflow-hidden">
          <div className="w-full">
            <div className="text-center mb-16 px-6">
              <Link to="/blog" className="inline-block group">
                <h2 className="section-heading mb-4 tracking-wide max-w-[90%] lg:max-w-2xl mx-auto cursor-pointer hover:text-primary transition-colors">
                  Latest News
                </h2>
              </Link>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-96 bg-black/5 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-5">
                {posts.map((post) => (
                   <BlogCardHome 
                    key={post.id}
                    title={decodeHtmlEntities(post.title.rendered)}
                    excerpt={cleanWordPressContent(post.excerpt.rendered).replace(/<[^>]+>/g, '').substring(0, 100) + "..."}
                    image={getOriginalImage(post._embedded?.["wp:featuredmedia"]?.[0]?.source_url)}
                    category={post._embedded?.["wp:term"]?.[1]?.find(t => t.taxonomy === "category")?.name || "News"}
                    author={{
                      name: post._embedded?.["author"]?.[0]?.name || "Admin",
                      avatar: post._embedded?.["author"]?.[0]?.avatar_urls?.["96"] || ""
                    }}
                    slug={post.slug}
                    className="rounded-xl hover:z-10 transition-transform"
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 w-10 h-10 flex items-center justify-center rounded border border-border bg-background/90 text-muted-foreground hover:text-foreground transition-colors shadow-sm z-50"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      <Footer />
    </div>
  );
};

export default Home;
