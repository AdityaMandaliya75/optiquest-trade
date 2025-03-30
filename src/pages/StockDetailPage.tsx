
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Stock, ChartData, OptionChain } from '@/types/market';
import { 
  getStockBySymbol, 
  getChartData, 
  getOptionChain, 
  subscribeToChart,
  subscribeToOptionChain
} from '@/services/realTimeMarketService';
import { placeOrder } from '@/services/portfolioService';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StockChart from '@/components/charts/StockChart';
import OptionChainTable from '@/components/markets/OptionChainTable';
import TradePanel from '@/components/trading/TradePanel';
import { formatNumber, formatPercent, getPriceChangeClass, abbreviateNumber } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const StockDetailPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [stock, setStock] = useState<Stock | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [optionChain, setOptionChain] = useState<OptionChain | null>(null);
  const [selectedOption, setSelectedOption] = useState<{
    option: any;
    underlyingSymbol: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!symbol) return;
    
    let unsubscribeChart: (() => void) | undefined;
    let unsubscribeOptionChain: (() => void) | undefined;
    
    const fetchData = async () => {
      try {
        const stockData = await getStockBySymbol(symbol);
        if (stockData) {
          setStock(stockData);
          
          // Get initial data
          const [chartData, optionChainData] = await Promise.all([
            getChartData(symbol),
            getOptionChain(symbol)
          ]);
          
          setChartData(chartData);
          setOptionChain(optionChainData || null);
          
          // Subscribe to real-time chart updates
          unsubscribeChart = subscribeToChart(symbol, (_, updatedChartData) => {
            setChartData(updatedChartData);
          });
          
          // Subscribe to real-time option chain updates
          if (optionChainData) {
            unsubscribeOptionChain = subscribeToOptionChain(symbol, (updatedOptionChain) => {
              setOptionChain(updatedOptionChain);
            });
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stock details:', error);
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to load stock data",
          variant: "destructive"
        });
      }
    };
    
    fetchData();
    
    return () => {
      if (unsubscribeChart) unsubscribeChart();
      if (unsubscribeOptionChain) unsubscribeOptionChain();
    };
  }, [symbol, toast]);
  
  const handleSelectOption = (type: 'call' | 'put', strikePrice: number) => {
    if (!optionChain) return;
    
    const options = type === 'call' ? optionChain.calls : optionChain.puts;
    const option = options.find(opt => opt.strikePrice === strikePrice);
    
    if (option) {
      setSelectedOption({
        option,
        underlyingSymbol: optionChain.underlyingSymbol
      });
    }
  };
  
  const handlePlaceOrder = async (
    symbol: string,
    quantity: number,
    price: number,
    type: 'buy' | 'sell',
    instrumentType: 'stock' | 'option',
    optionDetails?: {
      strikePrice: number;
      expiryDate: string;
      type: 'call' | 'put';
    }
  ) => {
    try {
      await placeOrder(symbol, quantity, price, type, instrumentType, optionDetails);
      toast({
        title: "Order Placed",
        description: `Successfully ${type} ${quantity} ${instrumentType} of ${symbol}`,
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: "There was an error placing your order",
        variant: "destructive"
      });
    }
  };
  
  if (loading || !stock) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p className="text-lg text-muted-foreground">Loading stock details...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{stock.symbol}</h1>
            <p className="text-muted-foreground">{stock.name}</p>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{formatNumber(stock.price)}</span>
              <span className={`px-2 py-1 rounded text-sm ${getPriceChangeClass(stock.change)}`}>
                {formatNumber(stock.change)} ({formatPercent(stock.changePercent)})
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Volume: {abbreviateNumber(stock.volume)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs defaultValue="chart">
              <TabsList className="mb-4">
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="options">Option Chain</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart">
                <StockChart data={chartData} symbol={stock.symbol} fullWidth />
              </TabsContent>
              
              <TabsContent value="options">
                {optionChain ? (
                  <OptionChainTable 
                    optionChain={optionChain} 
                    onSelectOption={handleSelectOption}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <p>No option chain data available for this stock.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Stock Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Open</p>
                        <p className="font-medium">{formatNumber(stock.open)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Previous Close</p>
                        <p className="font-medium">{formatNumber(stock.close)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Day High</p>
                        <p className="font-medium">{formatNumber(stock.high)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Day Low</p>
                        <p className="font-medium">{formatNumber(stock.low)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Volume</p>
                        <p className="font-medium">{abbreviateNumber(stock.volume)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Market Cap</p>
                        <p className="font-medium">{abbreviateNumber(stock.marketCap)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sector</p>
                        <p className="font-medium">{stock.sector || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            {selectedOption ? (
              <TradePanel
                option={selectedOption}
                onPlaceOrder={handlePlaceOrder}
              />
            ) : (
              <TradePanel
                stock={stock}
                onPlaceOrder={handlePlaceOrder}
              />
            )}
            
            {selectedOption && (
              <div className="mt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => setSelectedOption(null)}
                  className="w-full"
                >
                  Back to Stock Trading
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StockDetailPage;
