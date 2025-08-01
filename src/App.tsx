
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize the app
    const initializeApp = async () => {
      try {
        // Check if we have a valid session
        await supabase.auth.getSession();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">School Health Records</h2>
          <p className="text-gray-600">Loading system...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Main dashboard routes - all handled by Index/Dashboard */}
            <Route path="/" element={<Index />} />
            <Route path="/students/*" element={<Index />} />
            <Route path="/clinic/*" element={<Index />} />
            <Route path="/medications/*" element={<Index />} />
            <Route path="/immunizations/*" element={<Index />} />
            <Route path="/reports/*" element={<Index />} />
            <Route path="/staff/*" element={<Index />} />
            <Route path="/upload/*" element={<Index />} />
            <Route path="/settings/*" element={<Index />} />
            <Route path="/notifications/*" element={<Index />} />
            
            {/* Auth route */}
            <Route path="/auth" element={<Auth />} />
            
            {/* 404 route */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
