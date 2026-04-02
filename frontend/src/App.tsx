import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { GiftsProvider } from "@/contexts/GiftsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Store from "./pages/Store";
import StoreDetail from "./pages/StoreDetail";
import HowItWorks from "./pages/HowItWorks";
import Login from "./pages/admin/Login";
import Register from "./pages/admin/Register";
import Dashboard from "./pages/admin/Dashboard";
import Gifts from "./pages/admin/Gifts";
import Settings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <GiftsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Store />} />
              <Route path="/como-funciona" element={<HowItWorks />} />
              <Route path="/store/:slug" element={<StoreDetail />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin/register" element={<Register />} />

              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/gifts" element={<Gifts />} />
                <Route path="/admin/settings" element={<Settings />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </GiftsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;