
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
import VerticalOptionChainTable from '@/components/markets/VerticalOptionChainTable';
import TradePanel from '@/components/trading/TradePanel';
import { formatNumber, formatPercent, getPriceChangeClass, abbreviateNumber } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ArrowUpRight, ArrowDownRight, DollarSign, BarChart3, Activity, TrendingUp, Layers, BarChart2 } from 'lucide-react';

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
  const [optionViewType, setOptionViewType] = useState<'horizontal' | 'vertical'>('vertical');
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
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-lg text-muted-foreground">Loading market data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate price change class
  const priceChangeClass = getPriceChangeClass(stock.changePercent);
  const isPositiveChange = stock.change >= 0;
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-white">{stock.symbol}</h1>
                <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-600/30 text-blue-300 border border-blue-600">
                  {stock.sector || 'Finance'}
                </span>
              </div>
              <p className="text-gray-400">{stock.name}</p>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-white animate-pulse">
                  {formatNumber(stock.price)}
                </span>
                <div className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${isPositiveChange ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {isPositiveChange ? (
                    <ArrowUpRight size={16} className="mr-1" />
                  ) : (
                    <ArrowDownRight size={16} className="mr-1" />
                  )}
                  {formatNumber(stock.change)} ({formatPercent(stock.changePercent)})
                </div>
              </div>
              <div className="flex mt-2 divide-x divide-gray-600 text-sm text-gray-400">
                <div className="flex items-center pr-3">
                  <Activity size={14} className="mr-1" />
                  <span>Vol: {abbreviateNumber(stock.volume)}</span>
                </div>
                <div className="flex items-center px-3">
                  <BarChart3 size={14} className="mr-1" />
                  <span>H: {formatNumber(stock.high)}</span>
                </div>
                <div className="flex items-center px-3">
                  <BarChart2 size={14} className="mr-1" />
                  <span>L: {formatNumber(stock.low)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs defaultValue="chart" className="bg-black/40 backdrop-blur-sm rounded-lg border border-slate-700 p-1">
              <TabsList className="w-full bg-black/50 border-b border-slate-700 p-0">
                <TabsTrigger value="chart" className="flex items-center data-[state=active]:bg-blue-600">
                  <TrendingUp size={16} className="mr-2" />
                  Chart
                </TabsTrigger>
                <TabsTrigger value="options" className="flex items-center data-[state=active]:bg-blue-600">
                  <Layers size={16} className="mr-2" />
                  Option Chain
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center data-[state=active]:bg-blue-600">
                  <DollarSign size={16} className="mr-2" />
                  Details
                </TabsTrigger>
                {optionChain && (
                  <div className="ml-auto">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setOptionViewType(prev => prev === 'horizontal' ? 'vertical' : 'horizontal')}
                      className="h-8 text-xs text-gray-400 hover:text-white"
                    >
                      {optionViewType === 'vertical' ? 'Horizontal View' : 'Vertical View'}
                    </Button>
                  </div>
                )}
              </TabsList>
              
              <TabsContent value="chart" className="p-0 mt-0">
                <div className="bg-gradient-to-b from-slate-900 to-black p-4">
                  <StockChart data={chartData} symbol={stock.symbol} fullWidth />
                </div>
              </TabsContent>
              
              <TabsContent value="options" className="p-0 mt-0">
                {optionChain ? (
                  optionViewType === 'vertical' ? (
                    <VerticalOptionChainTable 
                      optionChain={optionChain} 
                      onSelectOption={handleSelectOption}
                    />
                  ) : (
                    <div className="p-4">
                      <OptionChainTable 
                        optionChain={optionChain} 
                        onSelectOption={handleSelectOption}
                      />
                    </div>
                  )
                ) : (
                  <Card className="border-0 bg-transparent">
                    <CardContent className="py-10 text-center">
                      <p>No option chain data available for this stock.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="details" className="p-4 mt-0">
                <Card className="border-0 bg-black/20 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Stock Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-950/20 p-3 rounded-lg border border-blue-900/50">
                        <p className="text-sm text-gray-400">Open</p>
                        <p className="font-medium text-white">{formatNumber(stock.open)}</p>
                      </div>
                      <div className="bg-blue-950/20 p-3 rounded-lg border border-blue-900/50">
                        <p className="text-sm text-gray-400">Previous Close</p>
                        <p className="font-medium text-white">{formatNumber(stock.close)}</p>
                      </div>
                      <div className="bg-blue-950/20 p-3 rounded-lg border border-blue-900/50">
                        <p className="text-sm text-gray-400">Day High</p>
                        <p className="font-medium text-green-400">{formatNumber(stock.high)}</p>
                      </div>
                      <div className="bg-blue-950/20 p-3 rounded-lg border border-blue-900/50">
                        <p className="text-sm text-gray-400">Day Low</p>
                        <p className="font-medium text-red-400">{formatNumber(stock.low)}</p>
                      </div>
                      <div className="bg-blue-950/20 p-3 rounded-lg border border-blue-900/50">
                        <p className="text-sm text-gray-400">Volume</p>
                        <p className="font-medium text-white">{abbreviateNumber(stock.volume)}</p>
                      </div>
                      <div className="bg-blue-950/20 p-3 rounded-lg border border-blue-900/50">
                        <p className="text-sm text-gray-400">Market Cap</p>
                        <p className="font-medium text-white">{abbreviateNumber(stock.marketCap)}</p>
                      </div>
                      <div className="bg-blue-950/20 p-3 rounded-lg border border-blue-900/50">
                        <p className="text-sm text-gray-400">Sector</p>
                        <p className="font-medium text-white">{stock.sector || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <div className="sticky top-20">
              <div className="bg-gradient-to-b from-slate-900 to-black rounded-lg border border-slate-700 overflow-hidden">
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
                  <div className="px-4 pb-4">
                    <Button 
                      variant="secondary" 
                      onClick={() => setSelectedOption(null)}
                      className="w-full bg-slate-800 text-white hover:bg-slate-700"
                    >
                      Back to Stock Trading
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StockDetailPage;
