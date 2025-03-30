import { Stock, MarketIndex, ChartData, OptionChain } from '@/types/market';
import { toast } from '@/hooks/use-toast';
import { mockStocks, mockIndices, mockOptionChain, mockChartData } from '@/data/mockData';

// For this example, we'll use a free WebSocket API for demo purposes
// In a real application, you would use a proper market data provider
// This is a simulated implementation since there's no free real-time Indian market data API

// Websocket connection for real-time updates
let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Callback functions for different data types
type StockUpdateCallback = (stocks: Stock[]) => void;
type IndexUpdateCallback = (indices: MarketIndex[]) => void;
type ChartUpdateCallback = (symbol: string, data: ChartData[]) => void;
type OptionChainUpdateCallback = (optionChain: OptionChain) => void;

const callbacks = {
  stocks: new Set<StockUpdateCallback>(),
  indices: new Set<IndexUpdateCallback>(),
  charts: new Map<string, Set<ChartUpdateCallback>>(),
  optionChains: new Map<string, Set<OptionChainUpdateCallback>>(),
};

// Initialize with mock data
let cachedStocks = [...mockStocks];
let cachedIndices = [...mockIndices];
const cachedCharts = new Map<string, ChartData[]>();
const cachedOptionChains = new Map<string, OptionChain>();

// Initialize cache with mock data
mockStocks.forEach(stock => {
  cachedCharts.set(stock.symbol, [...mockChartData]);
});
cachedOptionChains.set(mockOptionChain.underlyingSymbol, { ...mockOptionChain });

// Connect to WebSocket API
export const connectToMarketData = () => {
  if (socket) return;

  try {
    // For demo purpose, we'll use a free echo WebSocket server
    // In a real application, you'd use a proper market data WebSocket provider
    socket = new WebSocket('wss://demo.piesocket.com/v3/channel_123?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self');

    socket.onopen = () => {
      console.log('WebSocket connection established');
      reconnectAttempts = 0;
      // Subscribe to market data (in a real app, you'd send a subscription message)
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'subscribe', symbols: ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS'] }));
      }
    };

    socket.onmessage = (event) => {
      try {
        // In a real application, this would parse the incoming market data
        // For our demo, we'll simulate data updates
        simulateMarketDataUpdates();
      } catch (error) {
        console.error('Error processing market data:', error);
      }
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      socket = null;

      // Attempt to reconnect
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        setTimeout(connectToMarketData, 3000 * reconnectAttempts);
      } else {
        toast({
          title: "Connection Lost",
          description: "Unable to connect to market data. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  } catch (error) {
    console.error('Failed to connect to market data:', error);
    socket = null;
  }
};

// Disconnect from WebSocket API
export const disconnectFromMarketData = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }
  socket = null;
};

// Simulate market data updates
const simulateMarketDataUpdates = () => {
  // Update stocks with random price movements
  cachedStocks = cachedStocks.map(stock => {
    const changeAmount = (Math.random() - 0.5) * (stock.price * 0.01);
    const newPrice = parseFloat((stock.price + changeAmount).toFixed(2));
    const change = parseFloat((newPrice - stock.close).toFixed(2));
    const changePercent = parseFloat(((change / stock.close) * 100).toFixed(2));

    return {
      ...stock,
      price: newPrice,
      change,
      changePercent,
      high: Math.max(stock.high, newPrice),
      low: Math.min(stock.low, newPrice),
    };
  });

  // Update indices
  cachedIndices = cachedIndices.map(index => {
    const changeAmount = (Math.random() - 0.5) * (index.value * 0.005);
    const newValue = parseFloat((index.value + changeAmount).toFixed(2));
    const change = parseFloat((newValue - index.open).toFixed(2));
    const changePercent = parseFloat(((change / index.open) * 100).toFixed(2));

    return {
      ...index,
      value: newValue,
      change,
      changePercent,
      high: Math.max(index.high, newValue),
      low: Math.min(index.low, newValue),
    };
  });

  // Update chart data
  cachedCharts.forEach((chartData, symbol) => {
    if (chartData.length > 0) {
      const lastPoint = chartData[chartData.length - 1];
      const timestamp = lastPoint.timestamp + 5 * 60 * 1000; // Add 5 minutes
      const previousClose = lastPoint.close;
      const changeAmount = (Math.random() - 0.5) * (previousClose * 0.01);
      const close = parseFloat((previousClose + changeAmount).toFixed(2));
      const open = previousClose;
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;
      const volume = Math.floor(Math.random() * 10000 + 5000);

      chartData.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume,
      });

      // Keep the chart data size manageable
      if (chartData.length > 100) {
        chartData.shift();
      }

      // Notify subscribers
      const chartCallbacks = callbacks.charts.get(symbol);
      if (chartCallbacks) {
        chartCallbacks.forEach(callback => callback(symbol, [...chartData]));
      }
    }
  });

  // Update option chains
  cachedOptionChains.forEach((optionChain, symbol) => {
    const updatedCalls = optionChain.calls.map(option => {
      const changeAmount = (Math.random() - 0.5) * (option.lastPrice * 0.02);
      const newPrice = parseFloat((option.lastPrice + changeAmount).toFixed(2));
      const change = parseFloat((newPrice - (option.lastPrice - option.change)).toFixed(2));
      const changePercent = parseFloat(((change / (option.lastPrice - option.change)) * 100).toFixed(2));

      return {
        ...option,
        lastPrice: newPrice,
        change,
        changePercent,
      };
    });

    const updatedPuts = optionChain.puts.map(option => {
      const changeAmount = (Math.random() - 0.5) * (option.lastPrice * 0.02);
      const newPrice = parseFloat((option.lastPrice + changeAmount).toFixed(2));
      const change = parseFloat((newPrice - (option.lastPrice - option.change)).toFixed(2));
      const changePercent = parseFloat(((change / (option.lastPrice - option.change)) * 100).toFixed(2));

      return {
        ...option,
        lastPrice: newPrice,
        change,
        changePercent,
      };
    });

    const updatedOptionChain = {
      ...optionChain,
      calls: updatedCalls,
      puts: updatedPuts,
    };

    cachedOptionChains.set(symbol, updatedOptionChain);

    // Notify subscribers
    const optionChainCallbacks = callbacks.optionChains.get(symbol);
    if (optionChainCallbacks) {
      optionChainCallbacks.forEach(callback => callback(updatedOptionChain));
    }
  });

  // Notify subscribers
  callbacks.stocks.forEach(callback => callback([...cachedStocks]));
  callbacks.indices.forEach(callback => callback([...cachedIndices]));
};

// Initialize simulation when there's at least one subscriber
let simulationInterval: NodeJS.Timeout | null = null;

const startSimulation = () => {
  if (simulationInterval) return;
  simulationInterval = setInterval(simulateMarketDataUpdates, 3000);
};

const stopSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
};

// Subscribe to stock updates
export const subscribeToStocks = (callback: StockUpdateCallback): (() => void) => {
  callbacks.stocks.add(callback);
  
  // Start simulation if this is the first subscriber
  if (callbacks.stocks.size === 1) {
    startSimulation();
    connectToMarketData();
  }
  
  // Return unsubscribe function
  return () => {
    callbacks.stocks.delete(callback);
    if (callbacks.stocks.size === 0 && 
        callbacks.indices.size === 0 && 
        callbacks.charts.size === 0 && 
        callbacks.optionChains.size === 0) {
      stopSimulation();
      disconnectFromMarketData();
    }
  };
};

// Subscribe to index updates
export const subscribeToIndices = (callback: IndexUpdateCallback): (() => void) => {
  callbacks.indices.add(callback);
  
  // Start simulation if this is the first subscriber
  if (callbacks.indices.size === 1) {
    startSimulation();
    connectToMarketData();
  }
  
  // Return unsubscribe function
  return () => {
    callbacks.indices.delete(callback);
    if (callbacks.stocks.size === 0 && 
        callbacks.indices.size === 0 && 
        callbacks.charts.size === 0 && 
        callbacks.optionChains.size === 0) {
      stopSimulation();
      disconnectFromMarketData();
    }
  };
};

// Subscribe to chart updates for a specific symbol
export const subscribeToChart = (symbol: string, callback: ChartUpdateCallback): (() => void) => {
  if (!callbacks.charts.has(symbol)) {
    callbacks.charts.set(symbol, new Set());
  }
  
  const chartCallbacks = callbacks.charts.get(symbol)!;
  chartCallbacks.add(callback);
  
  // Initialize chart data if not already cached
  if (!cachedCharts.has(symbol)) {
    cachedCharts.set(symbol, [...mockChartData]);
  }
  
  // Start simulation if this is the first subscriber
  if (chartCallbacks.size === 1) {
    startSimulation();
    connectToMarketData();
  }
  
  // Immediately call the callback with current data
  callback(symbol, cachedCharts.get(symbol) || []);
  
  // Return unsubscribe function
  return () => {
    const chartCallbacks = callbacks.charts.get(symbol);
    if (chartCallbacks) {
      chartCallbacks.delete(callback);
      if (chartCallbacks.size === 0) {
        callbacks.charts.delete(symbol);
      }
    }
    
    if (callbacks.stocks.size === 0 && 
        callbacks.indices.size === 0 && 
        callbacks.charts.size === 0 && 
        callbacks.optionChains.size === 0) {
      stopSimulation();
      disconnectFromMarketData();
    }
  };
};

// Subscribe to option chain updates for a specific symbol
export const subscribeToOptionChain = (symbol: string, callback: OptionChainUpdateCallback): (() => void) => {
  if (!callbacks.optionChains.has(symbol)) {
    callbacks.optionChains.set(symbol, new Set());
  }
  
  const optionChainCallbacks = callbacks.optionChains.get(symbol)!;
  optionChainCallbacks.add(callback);
  
  // Initialize option chain data if not already cached
  if (!cachedOptionChains.has(symbol)) {
    cachedOptionChains.set(symbol, { ...mockOptionChain, underlyingSymbol: symbol });
  }
  
  // Start simulation if this is the first subscriber
  if (optionChainCallbacks.size === 1) {
    startSimulation();
    connectToMarketData();
  }
  
  // Immediately call the callback with current data
  callback(cachedOptionChains.get(symbol)!);
  
  // Return unsubscribe function
  return () => {
    const optionChainCallbacks = callbacks.optionChains.get(symbol);
    if (optionChainCallbacks) {
      optionChainCallbacks.delete(callback);
      if (optionChainCallbacks.size === 0) {
        callbacks.optionChains.delete(symbol);
      }
    }
    
    if (callbacks.stocks.size === 0 && 
        callbacks.indices.size === 0 && 
        callbacks.charts.size === 0 && 
        callbacks.optionChains.size === 0) {
      stopSimulation();
      disconnectFromMarketData();
    }
  };
};

// Get stock data
export const getStocks = async (): Promise<Stock[]> => {
  return [...cachedStocks];
};

// Get stock by symbol
export const getStockBySymbol = async (symbol: string): Promise<Stock | undefined> => {
  return cachedStocks.find(stock => stock.symbol === symbol);
};

// Get all indices
export const getIndices = async (): Promise<MarketIndex[]> => {
  return [...cachedIndices];
};

// Get chart data for a symbol
export const getChartData = async (symbol: string): Promise<ChartData[]> => {
  return cachedCharts.get(symbol) || [];
};

// Get option chain for a symbol
export const getOptionChain = async (symbol: string): Promise<OptionChain | undefined> => {
  return cachedOptionChains.get(symbol);
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
