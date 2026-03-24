import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BlogCard } from "@/components/BlogCard";
import { 
  ChevronRight, 
  Search, 
  Share2, 
  Mail, 
  Facebook, 
  Twitter, 
  MessageCircle,
  Clock,
  ChevronLeft,
  Loader2
} from "lucide-react";
import LazyImage from "@/components/ui/LazyImage";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  fetchPostBySlug, 
  fetchPosts, 
  fetchBlogCategories, 
  fetchAdjacentPosts,
  WordPressPost, 
  decodeHtmlEntities, 
  getOriginalImage,
  cleanWordPressContent
} from "@/lib/api";

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch the current post
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPostBySlug(slug || ""),
    enabled: !!slug,
  });

  // Fetch adjacent posts (Prev/Next)
  const { data: adjacentPosts } = useQuery({
    queryKey: ["adjacent-posts", post?.date],
    queryFn: () => fetchAdjacentPosts(post?.date || ""),
    enabled: !!post?.date,
  });

  // Fetch related posts (same category)
  const categoryId = post?.categories?.[0];
  const { data: relatedPosts } = useQuery({
    queryKey: ["related-posts", categoryId, post?.id],
    queryFn: async () => {
      const res = await fetchPosts(1, 3, categoryId);
      return res.data.filter((p: WordPressPost) => p.id !== post?.id).slice(0, 2);
    },
    enabled: !!categoryId && !!post?.id,
  });

  // Fetch sidebar data
  const { data: sidebarData } = useQuery({
    queryKey: ["blog-sidebar"],
    queryFn: async () => {
      const [recent, cats] = await Promise.all([
        fetchPosts(1, 4),
        fetchBlogCategories()
      ]);
      return { recent, cats };
    }
  });

  useEffect(() => {
    if (!isLoading && post && window.location.hash === '#comments') {
      setTimeout(() => {
        const element = document.getElementById('comments');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } else {
      window.scrollTo(0, 0);
    }
  }, [slug, isLoading, post]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-montserrat">
        <Header />
        <main className="flex-1 w-full px-4 md:px-8 lg:px-12 py-12">
          {/* Breadcrumbs Skeleton */}
          <div className="max-w-[1400px] mx-auto w-full mb-8">
            <div className="h-4 w-48 bg-black/5 animate-pulse rounded" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-12 max-w-[1800px] mx-auto">
            <article>
              <div className="h-6 w-24 bg-black/5 animate-pulse rounded mb-4" />
              <div className="h-12 w-full bg-black/5 animate-pulse rounded mb-6" />
              <div className="h-8 w-64 bg-black/5 animate-pulse rounded mb-10" />
              <div className="w-full aspect-video bg-black/5 animate-pulse rounded-xl mb-10" />
              <div className="space-y-4">
                <div className="h-4 w-full bg-black/5 animate-pulse rounded" />
                <div className="h-4 w-full bg-black/5 animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-black/5 animate-pulse rounded" />
              </div>
            </article>

            <aside className="space-y-12">
              <div className="h-12 w-full bg-black/5 animate-pulse rounded" />
              <div className="space-y-6">
                <div className="h-4 w-32 bg-black/5 animate-pulse rounded mb-8" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-16 h-16 bg-black/5 animate-pulse rounded-md" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-full bg-black/5 animate-pulse rounded" />
                      <div className="h-3 w-1/2 bg-black/5 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-10">
          <h2 className="text-2xl font-bold font-montserrat uppercase tracking-widest text-[#242424]">Post not found</h2>
          <Link to="/blog" className="text-primary hover:underline font-bold uppercase text-sm tracking-widest">Back to Blog</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const featuredImage = getOriginalImage(post._embedded?.["wp:featuredmedia"]?.[0]?.source_url);
  const authorName = post._embedded?.["author"]?.[0]?.name || "Admin";
  const authorAvatar = post._embedded?.["author"]?.[0]?.avatar_urls?.["96"] || "https://secure.gravatar.com/avatar/?s=96&d=mm&r=g";
  const categories = post._embedded?.["wp:term"]?.[0]?.filter((t: any) => t.taxonomy === "category") || [];
  const tags = post._embedded?.["wp:term"]?.[0]?.filter((t: any) => t.taxonomy === "post_tag") || [];

  return (
    <div className="min-h-screen bg-white flex flex-col font-montserrat text-[#242424]">
      <Header />

      <main className="flex-1 w-full px-4 md:px-8 lg:px-12 py-12">
        {/* Breadcrumbs */}
        <div className="max-w-[1400px] mx-auto w-full mb-8">
          <nav className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors uppercase tracking-wider font-semibold">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/blog" className="hover:text-primary transition-colors uppercase tracking-wider font-semibold">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-semibold uppercase tracking-wider truncate max-w-[200px] md:max-w-md">
              {decodeHtmlEntities(post.title.rendered)}
            </span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-12 max-w-[1800px] mx-auto">
          {/* Main Content Area */}
          <article className="min-w-0">
            {/* Category Badge */}
            <div className="mb-4 flex gap-2">
              {categories.map((cat: any) => (
                <span key={cat.id} className="bg-[#f2f2f2] text-[#242424] px-4 py-1 rounded-sm text-[11px] font-bold uppercase tracking-widest cursor-pointer hover:bg-primary hover:text-white transition-all">
                  {cat.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-[42px] font-bold text-[#242424] leading-tight mb-6 font-montserrat tracking-tight">
              {decodeHtmlEntities(post.title.rendered)}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 mb-10 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <img src={authorAvatar} alt={authorName} className="w-8 h-8 rounded-full" />
                <span className="text-[13px] font-semibold text-[#242424]">By <span className="hover:text-primary transition-colors cursor-pointer">{authorName}</span></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-[13px]">{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                <span className="text-[13px]">0 Comments</span>
              </div>
            </div>

            {/* Featured Image */}
            {featuredImage && (
              <div className="mb-10 rounded-xl overflow-hidden shadow-sm">
                <LazyImage 
                  src={featuredImage} 
                  alt={post.title.rendered} 
                  className="w-full h-auto object-cover max-h-[600px]"
                  containerClassName="w-full h-auto"
                />
              </div>
            )}

            {/* Content Body */}
            <div 
              className="prose prose-lg max-w-none text-[#555] leading-relaxed font-normal blog-content mb-12"
              dangerouslySetInnerHTML={{ __html: cleanWordPressContent(post.content.rendered) }}
            />

            {/* Social Share & Tags */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-[13px] font-bold uppercase tracking-widest text-[#242424]">Share:</span>
                <div className="flex items-center gap-2">
                  <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f2f2f2] text-[#555] hover:bg-primary hover:text-white transition-all">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f2f2f2] text-[#555] hover:bg-[#3b5998] hover:text-white transition-all">
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f2f2f2] text-[#555] hover:bg-black hover:text-white transition-all">
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f2f2f2] text-[#555] hover:bg-[#25d366] hover:text-white transition-all">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-bold uppercase tracking-widest text-[#242424]">Tags:</span>
                  {tags.map((tag: any, idx: number) => (
                    <span key={tag.id} className="text-[13px] text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                      {tag.name}{idx !== tags.length - 1 ? "," : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Post Navigation (Prev/Next) */}
            <div className="mt-12 flex flex-wrap border-y border-gray-100 py-10">
              {/* Previous Post */}
              <div className="w-full md:w-1/2 flex items-center gap-5 mb-8 md:mb-0 border-b md:border-b-0 md:border-r border-gray-100 pb-8 md:pb-0 pr-0 md:pr-6 group">
                {adjacentPosts?.previous ? (
                  <>
                    <Link to={`/blog/${adjacentPosts.previous.slug}`} className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 relative">
                      <LazyImage 
                        src={getOriginalImage(adjacentPosts.previous._embedded?.["wp:featuredmedia"]?.[0]?.source_url)} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        containerClassName="w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </div>
                    </Link>
                    <div className="flex-1">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#bbb] mb-2 font-montserrat">Previous Post</span>
                      <Link 
                        to={`/blog/${adjacentPosts.previous.slug}`} 
                        className="block text-base font-bold text-[#242424] hover:text-primary transition-colors line-clamp-2 leading-tight"
                      >
                        {decodeHtmlEntities(adjacentPosts.previous.title.rendered)}
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="w-full text-center md:text-left">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#eee]">No Previous Post</span>
                  </div>
                )}
              </div>

              {/* Next Post */}
              <div className="w-full md:w-1/2 flex items-center justify-end gap-5 pl-0 md:pl-6 group">
                {adjacentPosts?.next ? (
                  <>
                    <div className="flex-1 text-right">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#bbb] mb-2 font-montserrat">Next Post</span>
                      <Link 
                        to={`/blog/${adjacentPosts.next.slug}`} 
                        className="block text-base font-bold text-[#242424] hover:text-primary transition-colors line-clamp-2 leading-tight"
                      >
                        {decodeHtmlEntities(adjacentPosts.next.title.rendered)}
                      </Link>
                    </div>
                    <Link to={`/blog/${adjacentPosts.next.slug}`} className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 relative">
                      <LazyImage 
                        src={getOriginalImage(adjacentPosts.next._embedded?.["wp:featuredmedia"]?.[0]?.source_url)} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        containerClassName="w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-6 h-6 text-white" />
                      </div>
                    </Link>
                  </>
                ) : (
                  <div className="w-full text-center md:text-right">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#eee]">No Next Post</span>
                  </div>
                )}
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <div className="mt-20">
                <h3 className="text-2xl font-bold text-[#242424] mb-10 font-montserrat">Related posts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((p: WordPressPost) => (
                    <BlogCard 
                      key={p.id} 
                      id={p.id}
                      title={decodeHtmlEntities(p.title.rendered)}
                      image={getOriginalImage(p._embedded?.["wp:featuredmedia"]?.[0]?.source_url)}
                      category={p._embedded?.["wp:term"]?.[0]?.find((t: any) => t.taxonomy === "category")?.name || "News"}
                      excerpt="" 
                      slug={p.slug}
                      size="compact"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Comment Form */}
            <div id="comments" className="mt-16 bg-[#f9f9f9] p-8 md:p-12 rounded-lg">
              <h3 className="text-2xl font-bold text-[#242424] mb-8 font-montserrat">Leave a Reply</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#242424] uppercase tracking-widest mb-2">Comment</label>
                  <textarea rows={6} className="w-full border-gray-200 border bg-white rounded-sm px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#242424] uppercase tracking-widest mb-2">Name *</label>
                  <input type="text" className="w-full border-gray-200 border bg-white rounded-sm px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#242424] uppercase tracking-widest mb-2">Email *</label>
                  <input type="email" className="w-full border-gray-200 border bg-white rounded-sm px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#242424] uppercase tracking-widest mb-2">Website</label>
                  <input type="url" className="w-full border-gray-200 border bg-white rounded-sm px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="save-info" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <label htmlFor="save-info" className="text-sm text-[#555]">Save my name, email, and website in this browser for the next time I comment.</label>
                </div>
                <div className="md:col-span-2">
                  <button type="button" className="bg-primary text-white font-bold uppercase tracking-widest text-xs px-10 py-4 hover:bg-primary/90 transition-all rounded-sm shadow-lg shadow-primary/20">
                    Post Comment
                  </button>
                </div>
              </form>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-12">
            {/* Search */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full border-gray-200 border bg-white rounded-sm pl-4 pr-12 py-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Recent Posts */}
            <div>
              <h4 className="text-[15px] font-bold text-[#242424] uppercase tracking-[2px] mb-8 pb-4 border-b-2 border-primary w-fit">Recent Posts</h4>
              <div className="space-y-6">
                {sidebarData?.recent?.data?.map((p: WordPressPost) => (
                  <Link key={p.id} to={`/blog/${p.slug}`} className="flex gap-4 group cursor-pointer">
                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                      <LazyImage 
                        src={getOriginalImage(p._embedded?.["wp:featuredmedia"]?.[0]?.source_url)} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        containerClassName="w-full h-full"
                      />
                    </div>
                    <div>
                      <h5 className="text-[13px] font-bold text-[#242424] group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-1">
                        {decodeHtmlEntities(p.title.rendered)}
                      </h5>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-[15px] font-bold text-[#242424] uppercase tracking-[2px] mb-8 pb-4 border-b-2 border-primary w-fit">Categories</h4>
              <ul className="space-y-4">
                {sidebarData?.cats?.filter((c: any) => c.count > 0).map((cat: any) => (
                  <li key={cat.id} className="flex items-center justify-between text-[13px] font-semibold text-[#555] hover:text-primary transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary transition-colors" />
                      <span>{cat.name}</span>
                    </div>
                    <span className="text-muted-foreground font-normal">({cat.count})</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
