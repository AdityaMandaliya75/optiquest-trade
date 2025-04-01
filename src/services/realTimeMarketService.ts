
import { Stock, MarketIndex, Notification, ChartData, OptionChain } from '@/types/market';
import { getStocks, getIndices, getStockBySymbol, getChartData, getOptionChain, fetchFromEdgeFunction } from './marketService';
import { processStockUpdates } from './notificationService';

// Re-export functions from marketService
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

// External API fetching function
const fetchExternalStockData = async (): Promise<Stock[]> => {
  try {
    // Use edge function to fetch from Yahoo Finance or other API
    const response = await fetchFromEdgeFunction('external-stocks', { source: 'yahoo' });
    return response as Stock[] || [];
  } catch (error) {
    console.error("Error fetching external stock data:", error);
    // Fallback to database if API call fails
    return getStocks();
  }
};

// External API fetching for market indices
const fetchExternalIndicesData = async (): Promise<MarketIndex[]> => {
  try {
    // Use edge function to fetch market indices
    const response = await fetchFromEdgeFunction('external-indices', { source: 'yahoo' });
    return response as MarketIndex[] || [];
  } catch (error) {
    console.error("Error fetching external indices data:", error);
    // Fallback to database if API call fails
    return getIndices();
  }
};

// Start real-time updates
export const startRealTimeUpdates = (
  onStocksUpdate: StocksCallback,
  onIndicesUpdate: IndicesCallback,
  onNotificationsReceived?: NotificationCallback
): (() => void) => {
  let stocks: Stock[] = [];
  let indices: MarketIndex[] = [];
  
  // Add notification callback if provided
  if (onNotificationsReceived) {
    notificationCallbacks.push(onNotificationsReceived);
  }
  
  // Initialize data
  const initialize = async () => {
    try {
      // First try to fetch from external API
      try {
        stocks = await fetchExternalStockData();
      } catch (apiError) {
        console.error("Error fetching from external API, falling back to database:", apiError);
        stocks = await getStocks();
      }
      
      // Get indices data
      try {
        indices = await fetchExternalIndicesData();
      } catch (apiError) {
        console.error("Error fetching indices from external API, falling back to database:", apiError);
        indices = await getIndices();
      }
      
      // Send initial data
      onStocksUpdate([...stocks]);
      onIndicesUpdate([...indices]);
    } catch (error) {
      console.error("Error initializing real-time market data:", error);
      // Attempt to use database as ultimate fallback
      try {
        stocks = await getStocks();
        indices = await getIndices();
        onStocksUpdate([...stocks]);
        onIndicesUpdate([...indices]);
      } catch (dbError) {
        console.error("Critical error: Could not fetch data from any source", dbError);
      }
    }
  };
  
  initialize();
  
  // Update stocks every 5 seconds
  stocksInterval = window.setInterval(async () => {
    try {
      // Try to fetch fresh data from API first
      let freshData: Stock[] = [];
      
      try {
        freshData = await fetchExternalStockData();
        if (freshData.length > 0) {
          stocks = freshData;
          onStocksUpdate([...stocks]);
          return; // Exit early if we got fresh data
        }
      } catch (apiError) {
        console.log("Using simulation for stock updates", apiError);
      }
      
      // Fall back to simulation if API fails or returns empty data
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
  indicesInterval = window.setInterval(async () => {
    try {
      // Try to fetch fresh data from API first
      let freshData: MarketIndex[] = [];
      
      try {
        freshData = await fetchExternalIndicesData();
        if (freshData.length > 0) {
          indices = freshData;
          onIndicesUpdate([...indices]);
          return; // Exit early if we got fresh data
        }
      } catch (apiError) {
        console.log("Using simulation for indices updates", apiError);
      }
      
      // Fall back to simulation if API fails or returns empty data
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

// Register for notifications only
export const subscribeToNotifications = (callback: NotificationCallback): (() => void) => {
  notificationCallbacks.push(callback);
  
  return () => {
    notificationCallbacks = notificationCallbacks.filter(cb => cb !== callback);
  };
};

// Subscribe to real-time chart data updates
export const subscribeToChart = (
  symbol: string, 
  callback: ChartDataCallback
): (() => void) => {
  let chartData: ChartData[] = [];
  
  // Initialize with current data
  const initialize = async () => {
    try {
      // Try to fetch from external API first
      try {
        const response = await fetchFromEdgeFunction('external-chart', { symbol });
        chartData = response as ChartData[] || [];
        if (chartData.length === 0) {
          throw new Error("No chart data from external API");
        }
      } catch (apiError) {
        console.log("Falling back to database for chart data", apiError);
        chartData = await getChartData(symbol);
      }
      
      callback(symbol, [...chartData]);
    } catch (error) {
      console.error(`Error initializing chart data for ${symbol}:`, error);
    }
  };
  
  initialize();
  
  // Update chart data every 10 seconds
  chartIntervals[symbol] = window.setInterval(async () => {
    try {
      // Try to get fresh chart data from API
      let freshData: ChartData[] = [];
      
      try {
        const response = await fetchFromEdgeFunction('external-chart-update', { symbol });
        freshData = response as ChartData[] || [];
        if (freshData.length > 0) {
          chartData = freshData;
          callback(symbol, [...chartData]);
          return; // Exit early if we got fresh data
        }
      } catch (apiError) {
        console.log(`Using simulation for chart updates for ${symbol}`, apiError);
      }
      
      // Get latest data from database
      const latestData = await getChartData(symbol);
      
      // If we have data, add a new data point with slight changes
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
    } catch (error) {
      console.error(`Error updating chart data for ${symbol}:`, error);
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
): (() => void) => {
  let optionChain: OptionChain | null = null;
  let stockPrice: number = 0;
  
  // Initialize with current data
  const initialize = async () => {
    try {
      // Try to fetch option data from external API
      try {
        const response = await fetchFromEdgeFunction('external-options', { symbol });
        optionChain = response as OptionChain;
        if (!optionChain || (!optionChain.calls?.length && !optionChain.puts?.length)) {
          throw new Error("Invalid option data from external API");
        }
      } catch (apiError) {
        console.log("Falling back to database for option data", apiError);
        optionChain = await getOptionChain(symbol);
      }
      
      // Get current stock price
      const stock = await getStockBySymbol(symbol);
      stockPrice = stock?.price || 0;
      
      if (optionChain) {
        callback({...optionChain, underlyingPrice: stockPrice});
      }
    } catch (error) {
      console.error(`Error initializing option chain for ${symbol}:`, error);
    }
  };
  
  initialize();
  
  // Update option chain every 15 seconds
  optionChainIntervals[symbol] = window.setInterval(async () => {
    try {
      // Try to get fresh options data from API
      let freshData: OptionChain | null = null;
      
      try {
        const response = await fetchFromEdgeFunction('external-options-update', { symbol });
        freshData = response as OptionChain;
        if (freshData && (freshData.calls?.length || freshData.puts?.length)) {
          optionChain = freshData;
          const stock = await getStockBySymbol(symbol);
          stockPrice = stock?.price || 0;
          callback({...optionChain, underlyingPrice: stockPrice});
          return; // Exit early if we got fresh data
        }
      } catch (apiError) {
        console.log(`Using simulation for options updates for ${symbol}`, apiError);
      }
      
      const stock = await getStockBySymbol(symbol);
      stockPrice = stock?.price || 0;
      
      if (optionChain) {
        // Update call options
        const calls = optionChain.calls.map(option => {
          const changePercent = (Math.random() * 2 - 1) * 2; // Random change between -2% and 2%
          const priceChange = option.lastPrice * (changePercent / 100);
          const newPrice = option.lastPrice + priceChange;
          
          // Adjust open interest based on price movement
          const oiChange = Math.floor((Math.random() - 0.4) * 200);
          const newOI = Math.max(option.openInterest + oiChange, 0);
          
          return {
            ...option,
            lastPrice: parseFloat(newPrice.toFixed(2)),
            change: parseFloat((option.change + priceChange).toFixed(2)),
            changePercent: parseFloat((option.changePercent + changePercent).toFixed(2)),
            volume: option.volume + Math.floor(Math.random() * 20),
            openInterest: newOI
          };
        });
        
        // Update put options
        const puts = optionChain.puts.map(option => {
          const changePercent = (Math.random() * 2 - 1) * 2; // Random change between -2% and 2%
          const priceChange = option.lastPrice * (changePercent / 100);
          const newPrice = option.lastPrice + priceChange;
          
          // Adjust open interest based on price movement
          const oiChange = Math.floor((Math.random() - 0.4) * 200);
          const newOI = Math.max(option.openInterest + oiChange, 0);
          
          return {
            ...option,
            lastPrice: parseFloat(newPrice.toFixed(2)),
            change: parseFloat((option.change + priceChange).toFixed(2)),
            changePercent: parseFloat((option.changePercent + changePercent).toFixed(2)),
            volume: option.volume + Math.floor(Math.random() * 20),
            openInterest: newOI
          };
        });
        
        optionChain = {
          ...optionChain,
          underlyingPrice: stockPrice,
          calls,
          puts
        };
        
        callback({...optionChain});
      }
    } catch (error) {
      console.error(`Error updating option chain for ${symbol}:`, error);
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
