import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PublicPage from "./pages/PublicPage"; // Importando PublicPage
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // Importando Dashboard
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<AuthGuard isProtected={false}><Index /></AuthGuard>} />
          
          {/* Dynamic Public Profile Page */}
          <Route path="/u/:username" element={<AuthGuard isProtected={false}><PublicPage /></AuthGuard>} />
          
          {/* Authentication Route */}
          <Route path="/login" element={<AuthGuard isProtected={false}><Login /></AuthGuard>} />
          
          {/* Protected Dashboard Route */}
          <Route path="/dashboard" element={<AuthGuard isProtected={true}><Dashboard /></AuthGuard>} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;