import { Stock, MarketIndex, Notification, ChartData, OptionChain } from '@/types/market';
import { getStocks, getIndices, getStockBySymbol, getChartData, getOptionChain } from './marketService';
import { processStockUpdates } from './notificationService';

// Re-export functions from marketService to avoid breaking imports
export { getStockBySymbol, getChartData, getOptionChain };

// Callback types
type StocksCallback = (stocks: Stock[]) => void;
type IndicesCallback = (indices: MarketIndex[]) => void;
type NotificationCallback = (notifications: Notification[]) => void;
type ChartDataCallback = (symbol: string, data: ChartData[]) => void;
type OptionChainCallback = (optionChain: OptionChain) => void;

// Simulate real-time updates with intervals
let stocksInterval: number | null = null;
let indicesInterval: number | null = null;
let chartIntervals: Record<string, number> = {};
let optionChainIntervals: Record<string, number> = {};
let notificationCallbacks: NotificationCallback[] = [];

// Start real-time updates
export const startRealTimeUpdates = (
  onStocksUpdate: StocksCallback,
  onIndicesUpdate: IndicesCallback,
  onNotificationsReceived?: NotificationCallback
): () => void => {
  let stocks: Stock[] = [];
  let indices: MarketIndex[] = [];
  
  // Add notification callback if provided
  if (onNotificationsReceived) {
    notificationCallbacks.push(onNotificationsReceived);
  }
  
  // Initialize data
  const initialize = async () => {
    stocks = await getStocks();
    indices = await getIndices();
    
    // Send initial data
    onStocksUpdate([...stocks]);
    onIndicesUpdate([...indices]);
  };
  
  initialize();
  
  // Update stocks every 5 seconds
  stocksInterval = window.setInterval(() => {
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
  }, 5000);
  
  // Update indices every 10 seconds
  indicesInterval = window.setInterval(() => {
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

// Register for notifications only
export const subscribeToNotifications = (callback: NotificationCallback): () => void => {
  notificationCallbacks.push(callback);
  
  return () => {
    notificationCallbacks = notificationCallbacks.filter(cb => cb !== callback);
  };
};

// Subscribe to real-time chart data updates
export const subscribeToChart = (
  symbol: string, 
  callback: ChartDataCallback
): () => void => {
  let chartData: ChartData[] = [];
  
  // Initialize with current data
  const initialize = async () => {
    chartData = await getChartData(symbol);
    callback(symbol, [...chartData]);
  };
  
  initialize();
  
  // Update chart data every 10 seconds
  chartIntervals[symbol] = window.setInterval(async () => {
    // Get latest data
    const latestData = await getChartData(symbol);
    
    // Add a new data point with slight changes
    if (latestData.length > 0) {
      const lastPoint = latestData[latestData.length - 1];
      const newTimestamp = lastPoint.timestamp + 5 * 60 * 1000; // 5 minutes
      
      const changePercent = (Math.random() * 2 - 1) * 0.5; // Random change between -0.5% and 0.5%
      const close = lastPoint.close * (1 + changePercent / 100);
      const open = lastPoint.close;
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;
      const volume = lastPoint.volume + Math.floor(Math.random() * 10000);
      
      chartData = [
        ...latestData,
        { timestamp: newTimestamp, open, high, low, close, volume }
      ];
      
      // Keep only the latest 100 data points
      if (chartData.length > 100) {
        chartData = chartData.slice(-100);
      }
      
      callback(symbol, [...chartData]);
    }
  }, 10000);
  
  // Return cleanup function
  return () => {
    if (chartIntervals[symbol]) {
      window.clearInterval(chartIntervals[symbol]);
      delete chartIntervals[symbol];
    }
  };
};

// Subscribe to real-time option chain updates
export const subscribeToOptionChain = (
  symbol: string,
  callback: OptionChainCallback
): () => void => {
  let optionChain: OptionChain | undefined;
  
  // Initialize with current data
  const initialize = async () => {
    optionChain = await getOptionChain(symbol);
    if (optionChain) {
      callback({...optionChain});
    }
  };
  
  initialize();
  
  // Update option chain every 15 seconds
  optionChainIntervals[symbol] = window.setInterval(async () => {
    if (optionChain) {
      // Update call options
      const calls = optionChain.calls.map(option => {
        const changePercent = (Math.random() * 2 - 1) * 2; // Random change between -2% and 2%
        const priceChange = option.lastPrice * (changePercent / 100);
        const newPrice = option.lastPrice + priceChange;
        
        return {
          ...option,
          lastPrice: parseFloat(newPrice.toFixed(2)),
          change: parseFloat((option.change + priceChange).toFixed(2)),
          changePercent: parseFloat((option.changePercent + changePercent).toFixed(2)),
          volume: option.volume + Math.floor(Math.random() * 20)
        };
      });
      
      // Update put options
      const puts = optionChain.puts.map(option => {
        const changePercent = (Math.random() * 2 - 1) * 2; // Random change between -2% and 2%
        const priceChange = option.lastPrice * (changePercent / 100);
        const newPrice = option.lastPrice + priceChange;
        
        return {
          ...option,
          lastPrice: parseFloat(newPrice.toFixed(2)),
          change: parseFloat((option.change + priceChange).toFixed(2)),
          changePercent: parseFloat((option.changePercent + changePercent).toFixed(2)),
          volume: option.volume + Math.floor(Math.random() * 20)
        };
      });
      
      optionChain = {
        ...optionChain,
        calls,
        puts
      };
      
      callback({...optionChain});
    }
  }, 15000);
  
  // Return cleanup function
  return () => {
    if (optionChainIntervals[symbol]) {
      window.clearInterval(optionChainIntervals[symbol]);
      delete optionChainIntervals[symbol];
    }
  };
};
