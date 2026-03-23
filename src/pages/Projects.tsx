import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { ChevronRight, ChevronLeft, ChevronUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { fetchProjects, getOriginalImage } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const PROJECTS_PER_PAGE = 9;

const Projects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["projects", currentPage],
    queryFn: () => fetchProjects(currentPage, PROJECTS_PER_PAGE),
  });

  const projects = data?.data || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="bg-[#F9F9F9] flex-1">
        <section className="py-12 text-center">
          <h1 style={{ fontSize: '34px', fontWeight: 600, color: '#242424', fontFamily: 'Montserrat' }} className="font-heading mb-4">
            Projects
          </h1>
          <div className="flex items-center justify-center gap-2 text-[11px] uppercase text-muted-foreground font-bold">
            <Link to="/" className="hover:text-foreground transition-colors">HOME</Link>
            <span className="text-[10px] opacity-50">»</span>
            <span className="text-foreground">PROJECTS</span>
          </div>
        </section>

        <section className="w-full max-w-[1920px] mx-auto px-4 md:px-6 pb-16">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 font-medium mb-4">Error: {error instanceof Error ? error.message : "An unknown error occurred"}</p>
              <button 
                onClick={() => refetch()}
                className="px-4 py-2 bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No projects found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {projects.map((project, index) => {
                  const media = project._embedded?.["wp:featuredmedia"]?.[0];
                  const featuredImage = getOriginalImage(media?.media_details?.sizes?.full?.source_url || media?.source_url);
                  return (
                    <ProjectCard
                      key={project.id}
                      title={project.title.rendered}
                      image={featuredImage}
                      slug={project.slug}
                      delay={index * 100}
                    />
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-16 pb-10">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set("page", Math.max(1, currentPage - 1).toString());
                      setSearchParams(newParams);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-all disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set("page", page.toString());
                          setSearchParams(newParams);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`w-10 h-10 flex items-center justify-center rounded-sm text-sm font-semibold transition-all ${
                          page === currentPage
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set("page", Math.min(totalPages, currentPage + 1).toString());
                      setSearchParams(newParams);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-all disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 w-10 h-10 flex items-center justify-center rounded border border-border bg-background/90 text-muted-foreground hover:text-foreground transition-colors shadow-sm"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      <Footer />
    </div>
  );
};

export default Projects;
