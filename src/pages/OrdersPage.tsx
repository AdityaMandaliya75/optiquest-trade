
import React, { useState, useEffect } from 'react';
import { Order, TradeHistory } from '@/types/market';
import { getOrders, getTradeHistory } from '@/services/portfolioService';
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
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatCurrency, formatTimestamp, getPriceChangeClass } from '@/lib/utils';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, tradeHistoryData] = await Promise.all([
          getOrders(),
          getTradeHistory()
        ]);
        
        setOrders(ordersData);
        setTradeHistory(tradeHistoryData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p className="text-lg text-muted-foreground">Loading orders data...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Orders & Trades</h1>
        
        <Tabs defaultValue="orders">
          <TabsList className="mb-4">
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="history">Trade History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Orders</CardTitle>
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
                        <TableHead className="text-right">Value</TableHead>
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
                            <TableCell className="text-right">{formatCurrency(order.quantity * order.price)}</TableCell>
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
                          <TableCell colSpan={8} className="text-center py-4">
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
                        <TableHead className="text-right">Value</TableHead>
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
                            <TableCell className="text-right">{formatCurrency(trade.quantity * trade.price)}</TableCell>
                            <TableCell className={`text-right ${trade.pnl ? getPriceChangeClass(trade.pnl) : ''}`}>
                              {trade.pnl ? formatCurrency(trade.pnl) : '-'}
                            </TableCell>
                            <TableCell>{formatTimestamp(trade.timestamp)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4">
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

export default OrdersPage;
