
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { WatchlistProvider } from "./context/WatchlistContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import StockDetailPage from "./pages/StockDetailPage";
import PortfolioPage from "./pages/PortfolioPage";
import MarketsPage from "./pages/MarketsPage";
import OrdersPage from "./pages/OrdersPage";
import NewsPage from "./pages/NewsPage";
import WatchlistPage from "./pages/WatchlistPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <WatchlistProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/markets/stocks" element={
                  <ProtectedRoute>
                    <MarketsPage />
                  </ProtectedRoute>
                } />
                <Route path="/markets/stocks/:symbol" element={
                  <ProtectedRoute>
                    <StockDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/markets/indices" element={
                  <ProtectedRoute>
                    <MarketsPage />
                  </ProtectedRoute>
                } />
                <Route path="/markets/options" element={
                  <ProtectedRoute>
                    <StockDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/watchlist" element={
                  <ProtectedRoute>
                    <WatchlistPage />
                  </ProtectedRoute>
                } />
                <Route path="/news" element={
                  <ProtectedRoute>
                    <NewsPage />
                  </ProtectedRoute>
                } />
                <Route path="/portfolio" element={
                  <ProtectedRoute>
                    <PortfolioPage />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                } />
                <Route path="/charts/technical" element={
                  <ProtectedRoute>
                    <StockDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/charts/advanced" element={
                  <ProtectedRoute>
                    <StockDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </WatchlistProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
