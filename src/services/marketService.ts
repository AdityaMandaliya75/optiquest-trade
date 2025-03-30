import { Stock, MarketIndex, OptionChain, ChartData } from '../types/market';
import { 
  mockStocks, 
  mockIndices, 
  mockOptionChain, 
  mockChartData 
} from '../data/mockData';
import { generateRandomFluctuation } from '../lib/utils';

// In a real application, these would be API calls to market data providers
// For this demo we'll simulate real-time data with random fluctuations

let cachedStocks = [...mockStocks];
let cachedIndices = [...mockIndices];
let cachedOptionChain = { ...mockOptionChain };
let cachedChartData = [...mockChartData];

// Simulate websocket for real-time price updates (in a real app this would be a proper websocket)
let updateIntervals: Record<string, NodeJS.Timeout> = {};

// Get all stocks with updated prices
export const getStocks = async (): Promise<Stock[]> => {
  return cachedStocks;
};

// Get a specific stock by symbol
export const getStockBySymbol = async (symbol: string): Promise<Stock | undefined> => {
  return cachedStocks.find(stock => stock.symbol === symbol);
};

// Get all market indices
export const getIndices = async (): Promise<MarketIndex[]> => {
  return cachedIndices;
};

// Get option chain for a specific stock
export const getOptionChain = async (symbol: string): Promise<OptionChain | undefined> => {
  // In a real app, we would fetch the specific option chain
  // Here we just return the mock data if symbols match
  if (symbol === cachedOptionChain.underlyingSymbol) {
    return cachedOptionChain;
  }
  return undefined;
};

// Get chart data for a specific stock
export const getChartData = async (
  symbol: string,
  interval: string = '5min',
  days: number = 1
): Promise<ChartData[]> => {
  // In a real app, we would fetch specific chart data based on parameters
  // Here we just return the mock data
  return cachedChartData;
};

// Simulate real-time updates using random fluctuations
export const startRealTimeUpdates = (
  onStockUpdate: (stocks: Stock[]) => void,
  onIndexUpdate: (indices: MarketIndex[]) => void,
  updateInterval: number = 3000
) => {
  // Update stock prices
  updateIntervals.stocks = setInterval(() => {
    cachedStocks = cachedStocks.map(stock => {
      const newPrice = Number((stock.price + (Math.random() - 0.5) * 5).toFixed(2));
      const change = Number((newPrice - stock.close).toFixed(2));
      const changePercent = Number(((change / stock.close) * 100).toFixed(2));
      
      return {
        ...stock,
        price: newPrice,
        change,
        changePercent,
        high: Math.max(stock.high, newPrice),
        low: Math.min(stock.low, newPrice)
      };
    });
    
    onStockUpdate(cachedStocks);
  }, updateInterval);
  
  // Update index values
  updateIntervals.indices = setInterval(() => {
    cachedIndices = cachedIndices.map(index => {
      const newValue = Number((index.value + (Math.random() - 0.5) * 25).toFixed(2));
      const change = Number((newValue - index.open).toFixed(2));
      const changePercent = Number(((change / index.open) * 100).toFixed(2));
      
      return {
        ...index,
        value: newValue,
        change,
        changePercent,
        high: Math.max(index.high, newValue),
        low: Math.min(index.low, newValue)
      };
    });
    
    onIndexUpdate(cachedIndices);
  }, updateInterval);
  
  // Update option chain (less frequently)
  updateIntervals.options = setInterval(() => {
    const calls = cachedOptionChain.calls.map(option => {
      const newPrice = Number((option.lastPrice + (Math.random() - 0.5) * 2).toFixed(2));
      const change = Number((newPrice - (option.lastPrice - option.change)).toFixed(2));
      const changePercent = Number(((change / (option.lastPrice - option.change)) * 100).toFixed(2));
      
      return {
        ...option,
        lastPrice: newPrice,
        change,
        changePercent
      };
    });
    
    const puts = cachedOptionChain.puts.map(option => {
      const newPrice = Number((option.lastPrice + (Math.random() - 0.5) * 2).toFixed(2));
      const change = Number((newPrice - (option.lastPrice - option.change)).toFixed(2));
      const changePercent = Number(((change / (option.lastPrice - option.change)) * 100).toFixed(2));
      
      return {
        ...option,
        lastPrice: newPrice,
        change,
        changePercent
      };
    });
    
    cachedOptionChain = {
      ...cachedOptionChain,
      calls,
      puts
    };
  }, updateInterval * 2);
  
  // Update chart data by adding new points
  updateIntervals.chart = setInterval(() => {
    if (cachedChartData.length > 0) {
      const lastPoint = cachedChartData[cachedChartData.length - 1];
      const newTimestamp = lastPoint.timestamp + 5 * 60 * 1000; // 5 minutes
      
      const open = lastPoint.close;
      const close = open + (Math.random() - 0.5) * 10;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      const volume = Math.floor(Math.random() * 50000 + 10000);
      
      cachedChartData.push({ timestamp: newTimestamp, open, high, low, close, volume });
      
      // Remove oldest point to keep the array size constant
      if (cachedChartData.length > 100) {
        cachedChartData.shift();
      }
    }
  }, updateInterval * 10);
  
  return () => stopRealTimeUpdates();
};

// Stop all real-time updates
export const stopRealTimeUpdates = () => {
  Object.values(updateIntervals).forEach(interval => clearInterval(interval));
  updateIntervals = {};
};

// Search stocks
export const searchStocks = async (query: string): Promise<Stock[]> => {
  if (!query) return [];
  
  const lowerQuery = query.toLowerCase();
  return cachedStocks.filter(
    stock => 
      stock.symbol.toLowerCase().includes(lowerQuery) || 
      stock.name.toLowerCase().includes(lowerQuery)
  );
};
