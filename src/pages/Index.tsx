import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import projectSavola from "@/assets/project-savola.jpg";
import projectVxi from "@/assets/project-vxi.jpg";
import projectEgyptCable from "@/assets/project-egypt-cable.jpg";
import projectEcolab from "@/assets/project-ecolab.jpg";
import projectBupa from "@/assets/project-bupa.jpg";
import projectAllianz from "@/assets/project-allianz.jpg";
import { ChevronRight, ChevronUp } from "lucide-react";
import { useState } from "react";

const projects = [
  { title: "Savola", image: projectSavola },
  { title: "VXI", image: projectVxi },
  { title: "Egypt Cable", image: projectEgyptCable },
  { title: "ECOLAB", image: projectEcolab },
  { title: "BUPA", image: projectBupa },
  { title: "Allianz", image: projectAllianz },
];

const Index = () => {
  const [currentPage] = useState(1);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Page Header */}
      <section className="py-12 text-center">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-3">
          Projects
        </h1>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Home</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-accent font-medium">Portfolio</span>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="container pb-16 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.title}
              title={project.title}
              image={project.image}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-12">
          <button className="w-9 h-9 flex items-center justify-center rounded border border-foreground text-sm font-medium text-foreground">
            {currentPage}
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            2
          </button>
        </div>
      </section>

      {/* Scroll to top */}
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

export default Index;
