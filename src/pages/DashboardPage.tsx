
import React, { useState, useEffect } from 'react';
import { Stock, MarketIndex, ChartData } from '@/types/market';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStocks, getIndices, getChartData, startRealTimeUpdates } from '@/services/marketService';
import Layout from '@/components/layout/Layout';
import IndexCard from '@/components/dashboard/IndexCard';
import StockTable from '@/components/dashboard/StockTable';
import StockChart from '@/components/charts/StockChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DashboardPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stocksData, indicesData, chartData] = await Promise.all([
          getStocks(),
          getIndices(),
          getChartData('NIFTY50')
        ]);
        
        setStocks(stocksData);
        setIndices(indicesData);
        setChartData(chartData);
        setLoading(false);
        
        // Start real-time updates
        const cleanup = startRealTimeUpdates(
          (updatedStocks) => setStocks(updatedStocks),
          (updatedIndices) => setIndices(updatedIndices)
        );
        
        return cleanup;
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p className="text-lg text-muted-foreground">Loading market data...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {indices.map((index) => (
            <IndexCard key={index.symbol} index={index} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StockChart data={chartData} symbol="NIFTY 50" fullWidth />
          </div>
          
          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Market Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="gainers">
                  <TabsList className="grid w-full grid-cols-3 mb-2">
                    <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
                    <TabsTrigger value="losers">Top Losers</TabsTrigger>
                    <TabsTrigger value="active">Most Active</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="gainers">
                    <div className="space-y-2">
                      {stocks
                        .filter(stock => stock.change > 0)
                        .sort((a, b) => b.changePercent - a.changePercent)
                        .slice(0, 5)
                        .map(stock => (
                          <div key={stock.symbol} className="flex justify-between items-center p-2 rounded-md hover:bg-accent">
                            <div>
                              <div className="font-medium">{stock.symbol}</div>
                              <div className="text-xs text-muted-foreground">{stock.name}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-profit">{stock.price.toFixed(2)}</div>
                              <div className="text-xs text-profit">+{stock.changePercent.toFixed(2)}%</div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="losers">
                    <div className="space-y-2">
                      {stocks
                        .filter(stock => stock.change < 0)
                        .sort((a, b) => a.changePercent - b.changePercent)
                        .slice(0, 5)
                        .map(stock => (
                          <div key={stock.symbol} className="flex justify-between items-center p-2 rounded-md hover:bg-accent">
                            <div>
                              <div className="font-medium">{stock.symbol}</div>
                              <div className="text-xs text-muted-foreground">{stock.name}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-loss">{stock.price.toFixed(2)}</div>
                              <div className="text-xs text-loss">{stock.changePercent.toFixed(2)}%</div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="active">
                    <div className="space-y-2">
                      {stocks
                        .sort((a, b) => b.volume - a.volume)
                        .slice(0, 5)
                        .map(stock => (
                          <div key={stock.symbol} className="flex justify-between items-center p-2 rounded-md hover:bg-accent">
                            <div>
                              <div className="font-medium">{stock.symbol}</div>
                              <div className="text-xs text-muted-foreground">{stock.name}</div>
                            </div>
                            <div className="text-right">
                              <div className={stock.change >= 0 ? "text-profit" : "text-loss"}>{stock.price.toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground">Vol: {(stock.volume / 1000).toFixed(0)}K</div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <StockTable stocks={stocks} />
      </div>
    </Layout>
  );
};

export default DashboardPage;
