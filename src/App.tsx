import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import InstituteDashboard from "./pages/institute/InstituteDashboard";
import EvaluatorDashboard from "./pages/evaluator/EvaluatorDashboard";
import EVCDashboard from "./pages/evc/EVCDashboard";
import NewApplication from "./pages/institute/NewApplication";
import NotFound from "./pages/NotFound";

// Create QueryClient outside of component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/evaluator/dashboard" element={<EvaluatorDashboard />} />
            <Route path="/evc/dashboard" element={<EVCDashboard />} />
            <Route path="/institute/dashboard" element={<InstituteDashboard />} />
            <Route path="/institute/application/new" element={<NewApplication />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
