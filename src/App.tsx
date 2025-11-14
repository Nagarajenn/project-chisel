import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BlueprintGenerator from "./pages/BlueprintGenerator";
import BlueprintEditor from "./pages/BlueprintEditor";
import Export from "./pages/Export";
import Auth from "./pages/Auth";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Layout><Index /></Layout></ProtectedRoute>} />
            <Route path="/generate" element={<ProtectedRoute><Layout><BlueprintGenerator /></Layout></ProtectedRoute>} />
            <Route path="/editor" element={<ProtectedRoute><Layout><BlueprintEditor /></Layout></ProtectedRoute>} />
            <Route path="/export" element={<ProtectedRoute><Layout><Export /></Layout></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
