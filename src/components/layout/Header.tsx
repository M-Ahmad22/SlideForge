import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              SlideForge
            </span>
          </Link>
          {/* 
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/templates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Templates
            </Link>
          </nav> */}

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Log in</Link>
            </Button>
            <Button variant="gradient" size="sm" asChild>
              <Link to="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
