import { Stock, MarketIndex, Notification, ChartData, OptionChain } from '@/types/market';
import { getStocks, getIndices, getStockBySymbol, getChartData, getOptionChain } from './marketService';
import { processStockUpdates } from './notificationService';

// Export the startRealTimeUpdates function
export const startRealTimeUpdates = (
  onStocksUpdate: (stocks: Stock[]) => void,
  onIndicesUpdate: (indices: MarketIndex[]) => void,
  onNotificationsReceived?: (notifications: Notification[]) => void
): (() => void) => {
  let stocks: Stock[] = [];
  let indices: MarketIndex[] = [];
  let notificationCallbacks: ((notifications: Notification[]) => void)[] = [];
  
  // Add notification callback if provided
  if (onNotificationsReceived) {
    notificationCallbacks.push(onNotificationsReceived);
  }
  
  // Initialize data
  const initialize = async () => {
    try {
      stocks = await getStocks();
      indices = await getIndices();
      
      // Send initial data
      onStocksUpdate([...stocks]);
      onIndicesUpdate([...indices]);
    } catch (error) {
      console.error("Error initializing real-time market data:", error);
    }
  };
  
  initialize();
  
  // Update stocks every 5 seconds
  const stocksInterval = window.setInterval(() => {
    try {
      // Simulate price changes
      stocks = stocks.map(stock => {
        const changePercent = (Math.random() * 2 - 1) * 0.5; // Random change between -0.5% and 0.5%
        const priceChange = stock.price * (changePercent / 100);
        const newPrice = stock.price + priceChange;
        
        return {
          ...stock,
          price: parseFloat(newPrice.toFixed(2)),
          change: parseFloat((stock.change + priceChange).toFixed(2)),
          changePercent: parseFloat((stock.changePercent + changePercent).toFixed(2)),
          high: newPrice > stock.high ? newPrice : stock.high,
          low: newPrice < stock.low ? newPrice : stock.low,
          volume: stock.volume + Math.floor(Math.random() * 100000)
        };
      });
      
      // Send updated stocks
      onStocksUpdate([...stocks]);
      
      // Process for notifications
      const newNotifications = processStockUpdates(stocks);
      if (newNotifications.length > 0) {
        notificationCallbacks.forEach(callback => {
          callback(newNotifications);
        });
      }
    } catch (error) {
      console.error("Error updating stock data:", error);
    }
  }, 5000);
  
  // Update indices every 10 seconds
  const indicesInterval = window.setInterval(() => {
    try {
      // Simulate index changes
      indices = indices.map(index => {
        const changePercent = (Math.random() * 2 - 1) * 0.3; // Random change between -0.3% and 0.3%
        const valueChange = index.value * (changePercent / 100);
        const newValue = index.value + valueChange;
        
        return {
          ...index,
          value: parseFloat(newValue.toFixed(2)),
          change: parseFloat((index.change + valueChange).toFixed(2)),
          changePercent: parseFloat((index.changePercent + changePercent).toFixed(2)),
          high: newValue > index.high ? newValue : index.high,
          low: newValue < index.low ? newValue : index.low
        };
      });
      
      // Send updated indices
      onIndicesUpdate([...indices]);
    } catch (error) {
      console.error("Error updating index data:", error);
    }
  }, 10000);
  
  // Return cleanup function
  return () => {
    if (stocksInterval) window.clearInterval(stocksInterval);
    if (indicesInterval) window.clearInterval(indicesInterval);
    if (onNotificationsReceived) {
      notificationCallbacks = notificationCallbacks.filter(cb => cb !== onNotificationsReceived);
    }
  };
};

// Other real-time market functions can be added here
export const subscribeToStockUpdates = (
  symbol: string,
  callback: (stock: Stock) => void
): (() => void) => {
  let interval: number;
  
  const fetchAndUpdate = async () => {
    try {
      const stock = await getStockBySymbol(symbol);
      if (stock) {
        callback(stock);
      }
    } catch (error) {
      console.error(`Error fetching stock ${symbol}:`, error);
    }
  };
  
  // Initial fetch
  fetchAndUpdate();
  
  // Setup interval for updates
  interval = window.setInterval(fetchAndUpdate, 5000);
  
  // Return cleanup function
  return () => {
    window.clearInterval(interval);
  };
};
