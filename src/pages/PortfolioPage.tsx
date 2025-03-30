
import React, { useState, useEffect } from 'react';
import { PortfolioHolding, PortfolioSummary, Order, TradeHistory } from '@/types/market';
import { getPortfolioHoldings, getPortfolioSummary, getOrders, getTradeHistory } from '@/services/portfolioService';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PortfolioSummaryCard from '@/components/portfolio/PortfolioSummaryCard';
import PortfolioHoldingsTable from '@/components/portfolio/PortfolioHoldingsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatCurrency, formatTimestamp, getPriceChangeClass } from '@/lib/utils';

const PortfolioPage: React.FC = () => {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [holdingsData, summaryData, ordersData, tradeHistoryData] = await Promise.all([
          getPortfolioHoldings(),
          getPortfolioSummary(),
          getOrders(),
          getTradeHistory()
        ]);
        
        setHoldings(holdingsData);
        setSummary(summaryData);
        setOrders(ordersData);
        setTradeHistory(tradeHistoryData);
        setLoading(false);
        
        // Refresh holdings every 10 seconds to update prices
        const intervalId = setInterval(async () => {
          const [updatedHoldings, updatedSummary] = await Promise.all([
            getPortfolioHoldings(),
            getPortfolioSummary()
          ]);
          setHoldings(updatedHoldings);
          setSummary(updatedSummary);
        }, 10000);
        
        return () => clearInterval(intervalId);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading || !summary) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p className="text-lg text-muted-foreground">Loading portfolio data...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Portfolio</h1>
        
        <PortfolioSummaryCard summary={summary} />
        
        <Tabs defaultValue="holdings">
          <TabsList className="mb-4">
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="history">Trade History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="holdings">
            <PortfolioHoldingsTable holdings={holdings} />
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Your Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="stock-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.length > 0 ? (
                        orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>
                              {order.symbol}
                              {order.optionDetails && (
                                <div className="text-xs text-muted-foreground">
                                  {order.optionDetails.strikePrice} {order.optionDetails.type.toUpperCase()}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={order.type === 'buy' ? 'default' : 'destructive'}>
                                {order.type === 'buy' ? 'BUY' : 'SELL'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{order.quantity}</TableCell>
                            <TableCell className="text-right">{formatNumber(order.price)}</TableCell>
                            <TableCell>
                              <Badge variant={
                                order.status === 'executed' ? 'outline' : 
                                order.status === 'open' ? 'secondary' : 'destructive'
                              }>
                                {order.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatTimestamp(order.timestamp)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            No orders found. Start trading to see your orders.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Trade History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="stock-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">P&L</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tradeHistory.length > 0 ? (
                        tradeHistory.map((trade) => (
                          <TableRow key={trade.id}>
                            <TableCell className="font-medium">{trade.id}</TableCell>
                            <TableCell>
                              {trade.symbol}
                              {trade.optionDetails && (
                                <div className="text-xs text-muted-foreground">
                                  {trade.optionDetails.strikePrice} {trade.optionDetails.type.toUpperCase()}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={trade.type === 'buy' ? 'default' : 'destructive'}>
                                {trade.type === 'buy' ? 'BUY' : 'SELL'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{trade.quantity}</TableCell>
                            <TableCell className="text-right">{formatNumber(trade.price)}</TableCell>
                            <TableCell className={`text-right ${trade.pnl ? getPriceChangeClass(trade.pnl) : ''}`}>
                              {trade.pnl ? formatCurrency(trade.pnl) : '-'}
                            </TableCell>
                            <TableCell>{formatTimestamp(trade.timestamp)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            No trade history found. Complete trades to see your history.
                          </TableCell>
                        </TableRow>
                      )}
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

export default PortfolioPage;
