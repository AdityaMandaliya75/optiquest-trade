
import { Stock, MarketIndex, Notification, ChartData, OptionChain } from '@/types/market';
import { getStocks, getIndices, getStockBySymbol, getChartData, getOptionChain } from './marketService';
import { processStockUpdates } from './notificationService';
import { supabase } from '@/integrations/supabase/client';

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
    try {
      // Fetch from our edge function
      await fetchFromEdgeFunction('marketSummary');
      await fetchFromEdgeFunction('trending');
      
      // Get data from database
      stocks = await getStocks();
      indices = await getIndices();
      
      // Send initial data
      onStocksUpdate([...stocks]);
      onIndicesUpdate([...indices]);
      
      // Set up realtime subscriptions
      setupRealtimeSubscriptions(onStocksUpdate, onIndicesUpdate);
    } catch (error) {
      console.error("Error initializing real-time data:", error);
    }
  };
  
  initialize();
  
  // Update stocks every 15 seconds (Yahoo Finance API rate limit protection)
  stocksInterval = window.setInterval(async () => {
    try {
      // Fetch latest market data
      await fetchFromEdgeFunction('trending');
      
      // Get updated stocks
      const updatedStocks = await getStocks();
      stocks = updatedStocks;
      
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
      console.error("Error updating stocks:", error);
    }
  }, 15000);
  
  // Update indices every 30 seconds (Yahoo Finance API rate limit protection)
  indicesInterval = window.setInterval(async () => {
    try {
      // Fetch latest indices data
      await fetchFromEdgeFunction('marketSummary');
      
      // Get updated indices
      const updatedIndices = await getIndices();
      indices = updatedIndices;
      
      // Send updated indices
      onIndicesUpdate([...indices]);
    } catch (error) {
      console.error("Error updating indices:", error);
    }
  }, 30000);
  
  // Return cleanup function
  return () => {
    if (stocksInterval) window.clearInterval(stocksInterval);
    if (indicesInterval) window.clearInterval(indicesInterval);
    
    // Clean up realtime subscriptions
    supabase.removeAllChannels();
    
    if (onNotificationsReceived) {
      notificationCallbacks = notificationCallbacks.filter(cb => cb !== onNotificationsReceived);
    }
  };
};

// Setup realtime subscriptions for database changes
function setupRealtimeSubscriptions(onStocksUpdate: StocksCallback, onIndicesUpdate: IndicesCallback) {
  // Subscribe to stocks table
  const stocksChannel = supabase
    .channel('public:stocks')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'stocks' },
      async (payload) => {
        console.log('Realtime stocks update:', payload);
        // Fetch all stocks on any change
        const updatedStocks = await getStocks();
        onStocksUpdate(updatedStocks);
      }
    )
    .subscribe();
  
  // Subscribe to market indices table
  const indicesChannel = supabase
    .channel('public:market_indices')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'market_indices' },
      async (payload) => {
        console.log('Realtime indices update:', payload);
        // Fetch all indices on any change
        const updatedIndices = await getIndices();
        onIndicesUpdate(updatedIndices);
      }
    )
    .subscribe();
}

// Helper function to fetch from Edge Function
async function fetchFromEdgeFunction(action: string, params: Record<string, string> = {}) {
  try {
    // Add parameters
    const { data: result, error } = await supabase.functions.invoke('market-data', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: { action, ...params }
    });
    
    if (error) throw error;
    
    return result;
  } catch (error) {
    console.error(`Error calling edge function for ${action}:`, error);
    throw error;
  }
}

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
    // Fetch chart data
    await fetchFromEdgeFunction('chart', { symbol });
    
    // Get from database
    chartData = await getChartData(symbol);
    callback(symbol, [...chartData]);
  };
  
  initialize();
  
  // Update chart data every 3 minutes (Yahoo Finance API rate limit protection)
  chartIntervals[symbol] = window.setInterval(async () => {
    try {
      // Fetch latest chart data
      await fetchFromEdgeFunction('chart', { symbol });
      
      // Get from database
      const latestData = await getChartData(symbol);
      chartData = latestData;
      
      callback(symbol, [...chartData]);
    } catch (error) {
      console.error(`Error updating chart data for ${symbol}:`, error);
    }
  }, 180000);
  
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
  let optionChain: OptionChain | null = null;
  
  // Initialize with current data
  const initialize = async () => {
    try {
      // Fetch option chain data
      const result = await fetchFromEdgeFunction('options', { symbol });
      
      if (result) {
        optionChain = result as OptionChain;
        
        // Get current stock price
        const stock = await getStockBySymbol(symbol);
        if (stock && optionChain) {
          callback({...optionChain, underlyingPrice: stock.price});
        }
      }
    } catch (error) {
      console.error(`Error initializing option chain for ${symbol}:`, error);
    }
  };
  
  initialize();
  
  // Update option chain every 5 minutes (Yahoo Finance API rate limit protection)
  optionChainIntervals[symbol] = window.setInterval(async () => {
    try {
      // Fetch latest option chain
      const result = await fetchFromEdgeFunction('options', { symbol });
      
      if (result) {
        optionChain = result as OptionChain;
        
        // Get current stock price
        const stock = await getStockBySymbol(symbol);
        if (stock && optionChain) {
          callback({...optionChain, underlyingPrice: stock.price});
        }
      }
    } catch (error) {
      console.error(`Error updating option chain for ${symbol}:`, error);
    }
  }, 300000);
  
  // Return cleanup function
  return () => {
    if (optionChainIntervals[symbol]) {
      window.clearInterval(optionChainIntervals[symbol]);
      delete optionChainIntervals[symbol];
    }
  };
};
