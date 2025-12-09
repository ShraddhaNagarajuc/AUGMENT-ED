import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, ScanLine, BookOpen, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface TopicCardProps {
  title: string;
  description: string;
  image: string;
  overview?: string;
  keyPoints?: string[];
  references?: { label: string; url: string }[];
  onViewAR: () => void;
}

export const TopicCard = ({
  title,
  description,
  image,
  overview,
  keyPoints,
  references,
  onViewAR
}: TopicCardProps) => {
  return (
    <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-white/10 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
      {/* Image Container */}
      <div className="aspect-[4/3] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-black/0 transition-colors duration-500" />
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />

        {/* Floating Scan Button (Visible on Hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 transform scale-90 group-hover:scale-100">
          <Button
            onClick={onViewAR}
            size="lg"
            className="bg-white/90 text-black hover:bg-white hover:scale-105 transition-all shadow-xl font-bold rounded-full"
          >
            <ScanLine className="w-5 h-5 mr-2" />
            View in AR
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-4 relative z-10">
        <div>
          <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
        </div>

        <div className="pt-2 flex gap-3">
          <Button
            onClick={onViewAR}
            variant="default"
            className="flex-1 bg-primary/90 hover:bg-primary transition-all duration-300"
          >
            <Eye className="w-4 h-4 mr-2" />
            View in AR
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 border-primary/20 hover:bg-primary/10 group-hover:border-primary/50 transition-all duration-300"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Overview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold text-primary">{title}</DialogTitle>
                <div className="aspect-video w-full rounded-lg overflow-hidden mt-4">
                  <img src={image} alt={title} className="w-full h-full object-cover" />
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Overview Section */}
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Introduction
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">{overview || description}</p>
                </div>

                <Separator />

                {/* Key Points */}
                {keyPoints && keyPoints.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <ScanLine className="w-5 h-5 text-primary" />
                      Key Concepts
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300 bg-secondary/20 p-3 rounded-md">
                          <span className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator />

                {/* References */}
                {references && references.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold">Reference Materials</h4>
                    <div className="flex flex-wrap gap-3">
                      {references.map((ref, index) => (
                        <a
                          key={index}
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/20 transition-colors text-sm font-medium text-primary"
                        >
                          {ref.label}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
};
