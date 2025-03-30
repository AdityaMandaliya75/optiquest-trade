
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IndexCard from '@/components/dashboard/IndexCard';
import StockTable from '@/components/dashboard/StockTable';
import WatchlistPanel from '@/components/watchlist/WatchlistPanel';
import NewsPanel from '@/components/news/NewsPanel';
import { usePortfolioSummary } from '@/services/portfolioService';
import { getStocks, getIndices } from '@/services/marketService';
import { startRealTimeUpdates } from '@/services/realTimeMarketService';
import { Stock, MarketIndex } from '@/types/market';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatNumber, formatPercent } from '@/lib/utils';

const DashboardPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { data: portfolioSummary, isLoading: portfolioLoading } = usePortfolioSummary();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stocksData, indicesData] = await Promise.all([
          getStocks(),
          getIndices()
        ]);
        
        setStocks(stocksData);
        setIndices(indicesData);
        setLoading(false);
        
        // Start real-time updates
        const cleanup = startRealTimeUpdates(
          (updatedStocks) => setStocks(updatedStocks),
          (updatedIndices) => setIndices(updatedIndices)
        );
        
        return cleanup;
      } catch (error) {
        console.error('Error fetching market data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const renderContent = () => {
    if (loading || portfolioLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">Loading dashboard data...</p>
        </div>
      );
    }
    
    return (
      <div className="grid gap-6">
        {/* Portfolio Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Portfolio Value</CardDescription>
              <CardTitle className="text-3xl">
                ₹{formatNumber(portfolioSummary?.totalValue || 0)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                {portfolioSummary?.totalPnL && portfolioSummary.totalPnL >= 0 ? (
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                )}
                <span className={portfolioSummary?.totalPnL && portfolioSummary.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatPercent(portfolioSummary?.totalPnLPercent || 0)}
                </span>
                <span className="text-muted-foreground ml-1">all time</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Today's P&L</CardDescription>
              <CardTitle className={`text-3xl ${portfolioSummary?.todayPnL && portfolioSummary.todayPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ₹{formatNumber(portfolioSummary?.todayPnL || 0)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-muted-foreground">
                <span>Cash Balance: ₹{formatNumber(850000)}</span>
              </div>
            </CardContent>
          </Card>
          
          {indices.slice(0, 2).map((index) => (
            <IndexCard key={index.symbol} index={index} />
          ))}
        </div>
        
        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="top-gainers">
              <TabsList className="mb-4">
                <TabsTrigger value="top-gainers">Top Gainers</TabsTrigger>
                <TabsTrigger value="top-losers">Top Losers</TabsTrigger>
                <TabsTrigger value="most-active">Most Active</TabsTrigger>
              </TabsList>
              
              <TabsContent value="top-gainers">
                <StockTable 
                  stocks={stocks
                    .filter(stock => stock.changePercent > 0)
                    .sort((a, b) => b.changePercent - a.changePercent)
                    .slice(0, 5)} 
                />
              </TabsContent>
              
              <TabsContent value="top-losers">
                <StockTable 
                  stocks={stocks
                    .filter(stock => stock.changePercent < 0)
                    .sort((a, b) => a.changePercent - b.changePercent)
                    .slice(0, 5)} 
                />
              </TabsContent>
              
              <TabsContent value="most-active">
                <StockTable 
                  stocks={stocks
                    .sort((a, b) => b.volume - a.volume)
                    .slice(0, 5)} 
                />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:col-span-1">
            <WatchlistPanel stocks={stocks} />
          </div>
        </div>
        
        {/* News Section */}
        <div className="mt-4">
          <NewsPanel />
        </div>
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {renderContent()}
      </div>
    </Layout>
  );
};

export default DashboardPage;
