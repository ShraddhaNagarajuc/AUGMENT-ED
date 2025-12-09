import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ARStoryAnimation } from "./ARStoryAnimation";

interface HeroProps {
  onSearch: (query: string) => void;
}

export const Hero = ({ onSearch }: HeroProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-20">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 blur-[100px] rounded-full opacity-50 pointer-events-none" />

      {/* AR Animation Layer - Now overlaying everything */}
      <ARStoryAnimation />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-3 duration-700">
              <Sparkles className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">The Future of Education</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
              Augment<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient-x">ED</span>
            </h1>

            <p className="text-xl md:text-3xl text-muted-foreground/80 font-light leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150">
              Turn your world into a classroom. <br />
              <span className="text-foreground font-medium">Scan textbooks, interact with 3D models</span>, and learn faster.
            </p>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-7 duration-1000 delay-300">
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
              <Input
                placeholder="Search interactions (e.g., Brain, Heart...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="relative h-14 text-lg bg-background/80 backdrop-blur-xl border-white/10 focus:border-primary/50 transition-all rounded-xl pl-6"
              />
            </div>
            <Button
              onClick={handleSearch}
              size="lg"
              className="h-14 px-8 rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-glow hover:scale-105 transition-all duration-300 font-bold text-lg"
            >
              <Search className="w-5 h-5 mr-2" />
              Explore
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
