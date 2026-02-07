import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container relative mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Ready to transform your presentations?</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Start creating amazing
            <span className="block text-gradient">presentations today</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of students, researchers, and professionals who save hours 
            creating presentations with AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gradient" size="xl" asChild>
              <Link to="/dashboard">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
