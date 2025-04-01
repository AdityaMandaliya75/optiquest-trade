
import React, { useState, useEffect } from 'react';
import { Stock, MarketIndex } from '@/types/market';
import { getStocks, getIndices } from '@/services/marketService'; 
import { startRealTimeUpdates } from '@/services/realTimeMarketService';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { formatNumber, formatPercent, getPriceChangeClass, abbreviateNumber } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const MarketsPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
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
  
  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(filter.toLowerCase()) || 
    stock.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  const handleStockClick = (symbol: string) => {
    navigate(`/markets/stocks/${symbol}`);
  };
  
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
        <h1 className="text-3xl font-bold">Markets</h1>
        
        <Tabs defaultValue="stocks">
          <TabsList className="mb-4">
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="indices">Indices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stocks">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <CardTitle>All Stocks</CardTitle>
                  <div className="relative w-full max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by symbol or company name..."
                      className="pl-8"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="stock-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                        <TableHead className="text-right">High</TableHead>
                        <TableHead className="text-right">Low</TableHead>
                        <TableHead className="text-right">Volume</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStocks.map((stock) => (
                        <TableRow 
                          key={stock.symbol}
                          className="cursor-pointer"
                          onClick={() => handleStockClick(stock.symbol)}
                        >
                          <TableCell className="font-medium">{stock.symbol}</TableCell>
                          <TableCell>{stock.name}</TableCell>
                          <TableCell className="text-right">{formatNumber(stock.price)}</TableCell>
                          <TableCell className={`text-right ${getPriceChangeClass(stock.change)}`}>
                            {formatNumber(stock.change)} ({formatPercent(stock.changePercent)})
                          </TableCell>
                          <TableCell className="text-right">{formatNumber(stock.high)}</TableCell>
                          <TableCell className="text-right">{formatNumber(stock.low)}</TableCell>
                          <TableCell className="text-right">{abbreviateNumber(stock.volume)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="indices">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Market Indices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="stock-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                        <TableHead className="text-right">Open</TableHead>
                        <TableHead className="text-right">High</TableHead>
                        <TableHead className="text-right">Low</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {indices.map((index) => (
                        <TableRow key={index.symbol}>
                          <TableCell className="font-medium">{index.symbol}</TableCell>
                          <TableCell>{index.name}</TableCell>
                          <TableCell className="text-right">{formatNumber(index.value)}</TableCell>
                          <TableCell className={`text-right ${getPriceChangeClass(index.change)}`}>
                            {formatNumber(index.change)} ({formatPercent(index.changePercent)})
                          </TableCell>
                          <TableCell className="text-right">{formatNumber(index.open)}</TableCell>
                          <TableCell className="text-right">{formatNumber(index.high)}</TableCell>
                          <TableCell className="text-right">{formatNumber(index.low)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MarketsPage;
