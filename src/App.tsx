
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import StockDetailPage from "./pages/StockDetailPage";
import PortfolioPage from "./pages/PortfolioPage";
import MarketsPage from "./pages/MarketsPage";
import OrdersPage from "./pages/OrdersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/markets/stocks" element={<MarketsPage />} />
          <Route path="/markets/stocks/:symbol" element={<StockDetailPage />} />
          <Route path="/markets/indices" element={<MarketsPage />} />
          <Route path="/markets/options" element={<StockDetailPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/charts/technical" element={<StockDetailPage />} />
          <Route path="/charts/advanced" element={<StockDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
