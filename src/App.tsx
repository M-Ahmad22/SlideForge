import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreatePresentation from "./pages/CreatePresentation";
import Editor from "./pages/Editor";
import AdminDashboard from "./pages/AdminDashboard";
import SharedPresentation from "./pages/SharedPresentation";
import NotFound from "./pages/NotFound";
import { PublicPresentation, EmbedPresentation, LivePresentation } from "./pages/public";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreatePresentation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editor/:id"
        element={
          <ProtectedRoute>
            <Editor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Legacy shared route */}
      <Route path="/shared/:token" element={<SharedPresentation />} />
      
      {/* Standalone public routes - clean viewer experience (no auth required) */}
      <Route path="/p/:token" element={<PublicPresentation />} />
      <Route path="/view/:token" element={<PublicPresentation />} />
      <Route path="/present/:token" element={<PublicPresentation />} />
      <Route path="/embed/:token" element={<EmbedPresentation />} />
      <Route path="/live/:token" element={<LivePresentation />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AdminProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
