import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      
      <div className="container relative mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge variant="glow" className="mb-6 animate-fade-in">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Presentations
          </Badge>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
            Create stunning
            <span className="block text-gradient">presentations in seconds</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up stagger-1">
            Upload your research, notes, or documents. Let AI transform them into 
            professional presentations with beautiful slides, infographics, and animations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up stagger-2">
            <Button variant="gradient" size="xl" asChild>
              <Link to="/dashboard">
                Start Creating Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground animate-fade-in stagger-3">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Export to PPTX
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              10,000+ users
            </span>
          </div>
        </div>

        {/* Preview Image */}
        <div className="mt-16 max-w-5xl mx-auto animate-scale-in stagger-4">
          <div className="relative rounded-2xl overflow-hidden shadow-elevated border border-border/50 glow-border">
            <div className="aspect-video bg-gradient-card flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-full max-w-3xl mx-auto space-y-4">
                  {/* Mock Editor Preview */}
                  <div className="flex gap-4 h-64">
                    <div className="w-48 bg-secondary/50 rounded-lg p-3 space-y-2">
                      <div className="aspect-video bg-background rounded border border-border" />
                      <div className="aspect-video bg-background rounded border border-primary/50" />
                      <div className="aspect-video bg-background rounded border border-border" />
                    </div>
                    <div className="flex-1 bg-background rounded-lg border border-border flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <h3 className="text-2xl font-bold">AI Research Summary</h3>
                        <div className="space-y-1">
                          <div className="h-3 w-48 mx-auto bg-muted rounded" />
                          <div className="h-3 w-40 mx-auto bg-muted rounded" />
                          <div className="h-3 w-44 mx-auto bg-muted rounded" />
                        </div>
                      </div>
                    </div>
                    <div className="w-56 bg-secondary/50 rounded-lg p-3 space-y-3">
                      <div className="h-4 w-20 bg-muted rounded" />
                      <div className="space-y-2">
                        <div className="h-8 bg-background rounded" />
                        <div className="h-8 bg-background rounded" />
                      </div>
                      <div className="h-4 w-16 bg-muted rounded" />
                      <div className="grid grid-cols-3 gap-2">
                        <div className="aspect-square bg-primary/20 rounded" />
                        <div className="aspect-square bg-accent/20 rounded" />
                        <div className="aspect-square bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
