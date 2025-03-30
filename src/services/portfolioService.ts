import { PortfolioHolding, Order, TradeHistory, PortfolioSummary } from '../types/market';
import { mockPortfolioHoldings, mockOrders, mockTradeHistory, mockPortfolioSummary } from '../data/mockData';
import { getStockBySymbol, getOptionChain } from './marketService';

// Simulated portfolio data (in a real app would be persisted to a database)
let portfolioHoldings: PortfolioHolding[] = [...mockPortfolioHoldings];
let orders: Order[] = [...mockOrders];
let tradeHistory: TradeHistory[] = [...mockTradeHistory];
let portfolioSummary: PortfolioSummary = { ...mockPortfolioSummary };

// Get portfolio holdings
export const getPortfolioHoldings = async (): Promise<PortfolioHolding[]> => {
  // Update current prices and PnL based on latest market data
  const updatedHoldings = await Promise.all(portfolioHoldings.map(async (holding) => {
    try {
      if (holding.instrumentType === 'stock') {
        const stock = await getStockBySymbol(holding.symbol);
        if (stock) {
          const currentPrice = stock.price;
          const pnl = (currentPrice - holding.avgPrice) * holding.quantity;
          const pnlPercent = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
          
          return {
            ...holding,
            currentPrice,
            pnl,
            pnlPercent
          };
        }
      } else if (holding.instrumentType === 'option' && holding.optionDetails) {
        const optionChain = await getOptionChain(holding.symbol);
        if (optionChain) {
          const { strikePrice, type } = holding.optionDetails;
          const options = type === 'call' ? optionChain.calls : optionChain.puts;
          const option = options.find(opt => opt.strikePrice === strikePrice);
          
          if (option) {
            const currentPrice = option.lastPrice;
            const pnl = (currentPrice - holding.avgPrice) * holding.quantity;
            const pnlPercent = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
            
            return {
              ...holding,
              currentPrice,
              pnl,
              pnlPercent
            };
          }
        }
      }
      
      return holding;
    } catch (error) {
      console.error("Error updating portfolio holding:", error);
      return holding;
    }
  }));
  
  portfolioHoldings = updatedHoldings;
  return updatedHoldings;
};

// Get order history
export const getOrders = async (): Promise<Order[]> => {
  return orders;
};

// Get trade history
export const getTradeHistory = async (): Promise<TradeHistory[]> => {
  return tradeHistory;
};

// Get portfolio summary
export const getPortfolioSummary = async (): Promise<PortfolioSummary> => {
  // Recalculate based on current holdings
  const holdings = await getPortfolioHoldings();
  
  const totalValue = holdings.reduce((sum, holding) => 
    sum + (holding.currentPrice * holding.quantity), 0);
  
  const totalInvestment = holdings.reduce((sum, holding) => 
    sum + (holding.avgPrice * holding.quantity), 0);
  
  const totalPnL = holdings.reduce((sum, holding) => sum + holding.pnl, 0);
  
  const todayPnL = holdings.reduce((sum, holding) => {
    // In a real app, this would calculate just today's change
    // For this demo we'll use a portion of the total P&L
    return sum + (holding.pnl * Math.random() * 0.3);
  }, 0);
  
  const totalPnLPercent = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;
  
  portfolioSummary = {
    totalValue,
    totalInvestment,
    todayPnL,
    totalPnL,
    totalPnLPercent
  };
  
  return portfolioSummary;
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
  const id = `ORD${Math.floor(Math.random() * 1000000)}`;
  const timestamp = Date.now();
  
  const newOrder: Order = {
    id,
    symbol,
    quantity,
    price,
    type,
    status: 'executed', // In a real app, this would start as 'open'
    timestamp,
    instrumentType,
    optionDetails
  };
  
  orders = [newOrder, ...orders];
  
  // Add to trade history
  const tradeId = `TRD${Math.floor(Math.random() * 1000000)}`;
  const newTrade: TradeHistory = {
    id: tradeId,
    symbol,
    quantity,
    price,
    type,
    timestamp,
    instrumentType,
    optionDetails
  };
  
  tradeHistory = [newTrade, ...tradeHistory];
  
  // Update portfolio holdings
  await updatePortfolioAfterTrade(newOrder);
  
  return newOrder;
};

// Update portfolio holdings after a trade
const updatePortfolioAfterTrade = async (order: Order): Promise<void> => {
  const { symbol, quantity, price, type, instrumentType, optionDetails } = order;
  
  // Find if we already have this instrument in our portfolio
  const existingHoldingIndex = portfolioHoldings.findIndex(h => 
    h.symbol === symbol && 
    h.instrumentType === instrumentType &&
    // For options, also match strike price and type
    (instrumentType === 'stock' || 
      (h.optionDetails?.strikePrice === optionDetails?.strikePrice &&
       h.optionDetails?.type === optionDetails?.type))
  );
  
  if (type === 'buy') {
    if (existingHoldingIndex >= 0) {
      // Update existing holding
      const existingHolding = portfolioHoldings[existingHoldingIndex];
      const newQuantity = existingHolding.quantity + quantity;
      const newAvgPrice = ((existingHolding.avgPrice * existingHolding.quantity) + 
                          (price * quantity)) / newQuantity;
      
      portfolioHoldings[existingHoldingIndex] = {
        ...existingHolding,
        quantity: newQuantity,
        avgPrice: newAvgPrice,
        // Update current price and PnL
        currentPrice: price,
        pnl: (price - newAvgPrice) * newQuantity,
        pnlPercent: ((price - newAvgPrice) / newAvgPrice) * 100
      };
    } else {
      // Add new holding
      portfolioHoldings.push({
        symbol,
        quantity,
        avgPrice: price,
        currentPrice: price,
        pnl: 0,
        pnlPercent: 0,
        instrumentType,
        optionDetails
      });
    }
  } else if (type === 'sell') {
    if (existingHoldingIndex >= 0) {
      const existingHolding = portfolioHoldings[existingHoldingIndex];
      
      // Ensure we have enough quantity to sell
      if (existingHolding.quantity >= quantity) {
        const newQuantity = existingHolding.quantity - quantity;
        
        if (newQuantity > 0) {
          // Update the holding with new quantity
          portfolioHoldings[existingHoldingIndex] = {
            ...existingHolding,
            quantity: newQuantity,
            // Keep the same average price
            // Update current price and PnL
            currentPrice: price,
            pnl: (price - existingHolding.avgPrice) * newQuantity,
            pnlPercent: ((price - existingHolding.avgPrice) / existingHolding.avgPrice) * 100
          };
        } else {
          // Remove the holding if quantity is 0
          portfolioHoldings = portfolioHoldings.filter((_, index) => index !== existingHoldingIndex);
        }
        
        // Update the trade history with PnL for this sale
        const saleTradeIndex = tradeHistory.findIndex(t => t.id === `TRD${order.id.substring(3)}`);
        if (saleTradeIndex >= 0) {
          tradeHistory[saleTradeIndex] = {
            ...tradeHistory[saleTradeIndex],
            pnl: (price - existingHolding.avgPrice) * quantity
          };
        }
      } else {
        console.error("Not enough quantity to sell");
        // In a real app, this would throw an error or reject the order
      }
    } else {
      console.error("Cannot sell - holding not found in portfolio");
      // In a real app, this would throw an error or reject the order
    }
  }
  
  // Update portfolio summary
  await getPortfolioSummary();
};
