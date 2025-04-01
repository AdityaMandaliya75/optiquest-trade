import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PortfolioHolding, Order, TradeHistory, PortfolioSummary } from '../types/market';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { getStockBySymbol, getOptionChain } from './marketService';

// Get portfolio holdings from Supabase
export const getPortfolioHoldings = async (): Promise<PortfolioHolding[]> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('portfolio_holdings')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  const holdings: PortfolioHolding[] = await Promise.all((data || []).map(async (holding) => {
    try {
      let currentPrice = holding.avg_price;
      
      if (holding.instrument_type === 'stock') {
        const stock = await getStockBySymbol(holding.symbol);
        if (stock) {
          currentPrice = stock.price;
        }
      } else if (holding.instrument_type === 'option' && holding.option_strike_price) {
        const optionChain = await getOptionChain(holding.symbol);
        if (optionChain) {
          const options = holding.option_type === 'call' ? optionChain.calls : optionChain.puts;
          const option = options.find(opt => 
            opt.strikePrice === holding.option_strike_price && 
            opt.type === holding.option_type
          );
          
          if (option) {
            currentPrice = option.lastPrice;
          }
        }
      }
      
      const pnl = (currentPrice - holding.avg_price) * holding.quantity;
      const pnlPercent = ((currentPrice - holding.avg_price) / holding.avg_price) * 100;
      
      return {
        symbol: holding.symbol,
        quantity: holding.quantity,
        avgPrice: holding.avg_price,
        currentPrice,
        pnl,
        pnlPercent,
        instrumentType: holding.instrument_type as 'stock' | 'option',
        optionDetails: holding.instrument_type === 'option' ? {
          strikePrice: holding.option_strike_price,
          expiryDate: holding.option_expiry_date,
          type: holding.option_type as 'call' | 'put'
        } : undefined
      };
    } catch (error) {
      console.error("Error updating portfolio holding:", error);
      return {
        symbol: holding.symbol,
        quantity: holding.quantity,
        avgPrice: holding.avg_price,
        currentPrice: holding.avg_price,
        pnl: 0,
        pnlPercent: 0,
        instrumentType: holding.instrument_type as 'stock' | 'option',
        optionDetails: holding.instrument_type === 'option' ? {
          strikePrice: holding.option_strike_price,
          expiryDate: holding.option_expiry_date,
          type: holding.option_type as 'call' | 'put'
        } : undefined
      };
    }
  }));
  
  return holdings;
};

// Get order history
export const getOrders = async (): Promise<Order[]> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(order => ({
    id: order.id,
    symbol: order.symbol,
    quantity: order.quantity,
    price: order.price,
    type: order.type as 'buy' | 'sell',
    status: order.status as 'open' | 'executed' | 'canceled',
    timestamp: new Date(order.created_at).getTime(),
    instrumentType: order.instrument_type as 'stock' | 'option',
    optionDetails: order.instrument_type === 'option' ? {
      strikePrice: order.option_strike_price,
      expiryDate: order.option_expiry_date,
      type: order.option_type as 'call' | 'put'
    } : undefined
  }));
};

// Mock function for trade history 
export const getTradeHistory = async (): Promise<TradeHistory[]> => {
  const orders = await getOrders();
  
  return orders.map(order => ({
    id: order.id,
    symbol: order.symbol,
    quantity: order.quantity,
    price: order.price,
    type: order.type,
    timestamp: order.timestamp,
    instrumentType: order.instrumentType,
    pnl: Math.random() > 0.5 ? (Math.random() * 100 * (Math.random() > 0.5 ? 1 : -1)) : undefined,
    optionDetails: order.optionDetails
  }));
};

// Get portfolio summary
export const getPortfolioSummary = async (): Promise<PortfolioSummary> => {
  const holdings = await getPortfolioHoldings();
  
  const totalValue = holdings.reduce((sum, holding) => 
    sum + (holding.currentPrice * holding.quantity), 0);
  
  const totalInvestment = holdings.reduce((sum, holding) => 
    sum + (holding.avgPrice * holding.quantity), 0);
  
  const totalPnL = holdings.reduce((sum, holding) => sum + holding.pnl, 0);
  
  const todayPnL = holdings.reduce((sum, holding) => {
    return sum + (holding.pnl * Math.random() * 0.3);
  }, 0);
  
  const totalPnLPercent = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;
  
  return {
    totalValue,
    totalInvestment,
    todayPnL,
    totalPnL,
    totalPnLPercent
  };
};

// Custom hook to get portfolio summary with React Query
export const usePortfolioSummary = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['portfolioSummary'],
    queryFn: getPortfolioSummary,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
    enabled: isAuthenticated
  });
};

// Place a new order
export const placeOrder = async (
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
): Promise<Order> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }
  
  const userId = session.session.user.id;
  
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      symbol,
      quantity,
      price,
      type,
      status: 'executed',
      instrument_type: instrumentType,
      option_strike_price: optionDetails?.strikePrice,
      option_expiry_date: optionDetails?.expiryDate,
      option_type: optionDetails?.type
    })
    .select()
    .single();
  
  if (orderError) throw orderError;
  
  await updatePortfolioAfterOrder(userId, {
    symbol,
    quantity,
    price,
    type,
    instrumentType,
    optionDetails
  });
  
  return {
    id: orderData.id,
    symbol,
    quantity,
    price,
    type,
    status: 'executed',
    timestamp: new Date(orderData.created_at).getTime(),
    instrumentType,
    optionDetails
  };
};

// Update portfolio holdings after an order
const updatePortfolioAfterOrder = async (
  userId: string,
  order: {
    symbol: string;
    quantity: number;
    price: number;
    type: 'buy' | 'sell';
    instrumentType: 'stock' | 'option';
    optionDetails?: {
      strikePrice: number;
      expiryDate: string;
      type: 'call' | 'put';
    };
  }
) => {
  const { symbol, quantity, price, type, instrumentType, optionDetails } = order;
  
  const { data: existingHolding, error: holdingError } = await supabase
    .from('portfolio_holdings')
    .select('*')
    .eq('user_id', userId)
    .eq('symbol', symbol)
    .eq('instrument_type', instrumentType)
    .eq('option_strike_price', optionDetails?.strikePrice || null)
    .eq('option_expiry_date', optionDetails?.expiryDate || null)
    .eq('option_type', optionDetails?.type || null)
    .maybeSingle();
  
  if (holdingError) throw holdingError;
  
  if (type === 'buy') {
    if (existingHolding) {
      const newQuantity = existingHolding.quantity + quantity;
      const newAvgPrice = ((existingHolding.avg_price * existingHolding.quantity) + 
                          (price * quantity)) / newQuantity;
      
      const { error: updateError } = await supabase
        .from('portfolio_holdings')
        .update({
          quantity: newQuantity,
          avg_price: newAvgPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingHolding.id);
      
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('portfolio_holdings')
        .insert({
          user_id: userId,
          symbol,
          quantity,
          avg_price: price,
          instrument_type: instrumentType,
          option_strike_price: optionDetails?.strikePrice,
          option_expiry_date: optionDetails?.expiryDate,
          option_type: optionDetails?.type
        });
      
      if (insertError) throw insertError;
    }
  } else if (type === 'sell') {
    if (existingHolding) {
      if (existingHolding.quantity >= quantity) {
        const newQuantity = existingHolding.quantity - quantity;
        
        if (newQuantity > 0) {
          const { error: updateError } = await supabase
            .from('portfolio_holdings')
            .update({
              quantity: newQuantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingHolding.id);
          
          if (updateError) throw updateError;
        } else {
          const { error: deleteError } = await supabase
            .from('portfolio_holdings')
            .delete()
            .eq('id', existingHolding.id);
          
          if (deleteError) throw deleteError;
        }
      } else {
        throw new Error("Not enough quantity to sell");
      }
    } else {
      throw new Error("Cannot sell - holding not found in portfolio");
    }
  }
};

// Custom hook for placing orders
export const usePlaceOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: {
      symbol: string;
      quantity: number;
      price: number;
      type: 'buy' | 'sell';
      instrumentType: 'stock' | 'option';
      optionDetails?: {
        strikePrice: number;
        expiryDate: string;
        type: 'call' | 'put';
      };
    }) => placeOrder(
      orderData.symbol,
      orderData.quantity,
      orderData.price,
      orderData.type,
      orderData.instrumentType,
      orderData.optionDetails
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioHoldings'] });
      queryClient.invalidateQueries({ queryKey: ['portfolioSummary'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
};

// Custom hook to get portfolio holdings with React Query
export const usePortfolioHoldings = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['portfolioHoldings'],
    queryFn: getPortfolioHoldings,
    refetchInterval: 30000,
    staleTime: 20000,
    enabled: isAuthenticated
  });
};

// Custom hook to get orders with React Query
export const useOrders = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    staleTime: 30000,
    enabled: isAuthenticated
  });
};

// Custom hook to get trade history with React Query
export const useTradeHistory = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['tradeHistory'],
    queryFn: getTradeHistory,
    staleTime: 30000,
    enabled: isAuthenticated
  });
};
