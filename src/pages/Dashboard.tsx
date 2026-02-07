import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, MoreHorizontal, Trash2, Edit3, Clock, Layers, Zap, Loader2, LogOut, User, Copy, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePresentations, DBPresentation } from "@/hooks/usePresentations";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { SlidePreview } from "@/components/SlidePreview";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { presentations, isLoading, deletePresentation, duplicatePresentation } = usePresentations();
  const [searchQuery, setSearchQuery] = useState("");

  const handleDuplicate = async (presentationId: string) => {
    try {
      const newPresentation = await duplicatePresentation(presentationId);
      if (newPresentation) {
        toast.success("Presentation duplicated!");
        navigate(`/editor/${newPresentation.id}`);
      }
    } catch (error) {
      toast.error("Failed to duplicate presentation");
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const filteredProjects = presentations.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Unknown";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "ready": return "default";
      case "generating": return "secondary";
      case "draft": return "outline";
      default: return "outline";
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SlideForge</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Button variant="gradient" onClick={() => navigate("/create")}>
                <Plus className="h-4 w-4 mr-2" />
                New Presentation
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Your Presentations</h1>
            <p className="text-muted-foreground">
              Create, edit, and manage your AI-generated presentations
            </p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search presentations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card 
            className="cursor-pointer group hover:border-primary/50 transition-colors"
            onClick={() => navigate("/create")}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Create New</h3>
                <p className="text-sm text-muted-foreground">Start from scratch with AI</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group hover:border-primary/50 transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Templates</h3>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group hover:border-primary/50 transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Recent</h3>
                <p className="text-sm text-muted-foreground">{presentations.length} presentations</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="group hover:border-primary/50 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                    {project.topic && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {project.topic}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/editor/${project.id}`)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(project.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => deletePresentation(project.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {/* Thumbnail */}
                <div 
                  className="aspect-video bg-secondary rounded-lg mb-4 flex items-center justify-center cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/editor/${project.id}`)}
                >
                  <div className="text-center p-4 w-full">
                    <div className="h-3 w-32 bg-muted rounded mb-2 mx-auto" />
                    <div className="h-2 w-24 bg-muted/50 rounded mb-1 mx-auto" />
                    <div className="h-2 w-28 bg-muted/50 rounded mx-auto" />
                  </div>
                </div>
                
                {/* Meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Layers className="h-4 w-4" />
                    <span>{project.slide_count || 0} slides</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status || 'draft'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(project.updated_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Layers className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No presentations found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try a different search term" : "Create your first AI-powered presentation"}
            </p>
            <Button variant="gradient" onClick={() => navigate("/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Presentation
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
