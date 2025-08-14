import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import { Login } from "./pages/Login";
import { AllBets } from "./pages/AllBets";
import NotFound from "./pages/NotFound";
import { Suspense, lazy } from "react";

const MatchesAdmin = lazy(() => import("@/components/MatchesAdmin"));
const PlayersAdmin = lazy(() => import("@/components/PlayersAdmin"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bets"
              element={
                <ProtectedRoute>
                  <AllBets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/matches"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div style={{ padding: 16 }}>Загрузка…</div>}>
                    <MatchesAdmin />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/players"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div style={{ padding: 16 }}>Загрузка…</div>}>
                    <PlayersAdmin />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
