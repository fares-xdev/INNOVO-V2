import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BlogCard } from "@/components/BlogCard";
import { Link } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchPosts, WordPressPost, decodeHtmlEntities, getOriginalImage, cleanWordPressContent } from "@/lib/api";

export default function Blog() {
  const { data: postsData, isLoading, isError } = useQuery({
    queryKey: ["posts"],
    queryFn: () => fetchPosts(1, 12),
  });

  const posts = postsData?.data || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Simplified Hero Section matching user screenshot */}
        <section className="py-12 md:py-16 text-center">
          <h1 style={{ fontSize: '34px', fontWeight: 600, color: '#242424', fontFamily: 'Montserrat' }} className="mb-4">
            Blog
          </h1>
          <nav className="flex items-center justify-center gap-2 text-sm">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider font-semibold"
            >
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-semibold uppercase tracking-wider">Blog</span>
          </nav>
        </section>

        {/* Blog Grid */}
        <section className="w-full px-5 pb-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[16/9] bg-black/5 animate-pulse rounded-xl" />
                  <div className="h-4 w-3/4 bg-black/5 animate-pulse rounded" />
                  <div className="h-4 w-1/2 bg-black/5 animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20">
              <p className="text-red-500">Failed to load blog posts. Please try again later.</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No blog posts found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post: WordPressPost) => (
                <BlogCard 
                  key={post.id}
                  id={post.id}
                  title={decodeHtmlEntities(post.title.rendered)}
                  excerpt={cleanWordPressContent(post.excerpt.rendered).replace(/<[^>]+>/g, '').substring(0, 120) + "..."}
                  image={getOriginalImage(post._embedded?.["wp:featuredmedia"]?.[0]?.source_url)}
                  category={post._embedded?.["wp:term"]?.[0]?.find((t: any) => t.taxonomy === "category")?.name || "News"}
                  author={{
                    name: post._embedded?.["author"]?.[0]?.name || "Admin",
                    avatar: post._embedded?.["author"]?.[0]?.avatar_urls?.["96"] || ""
                  }}
                  slug={post.slug}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 w-10 h-10 flex items-center justify-center rounded border border-border bg-white text-muted-foreground hover:text-foreground transition-colors shadow-md z-50"
      >
        <ChevronRight className="w-5 h-5 -rotate-90" />
      </button>

      <Footer />
    </div>
  );
}

