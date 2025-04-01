
import { Stock, MarketIndex, ChartData, OptionChain } from '@/types/market';
import { supabase } from '@/integrations/supabase/client';

// Get a list of stocks from Supabase
export const getStocks = async (): Promise<Stock[]> => {
  try {
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .order('symbol');
    
    if (error) {
      console.error("Error fetching stocks:", error);
      throw error;
    }
    
    return mapStocksFromDatabase(data || []);
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return [];
  }
};

// Get a single stock by symbol
export const getStockBySymbol = async (symbol: string): Promise<Stock | null> => {
  try {
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .eq('symbol', symbol)
      .maybeSingle();
    
    if (error) {
      console.error(`Error fetching stock ${symbol}:`, error);
      throw error;
    }
    
    if (!data) return null;
    
    return mapStockFromDatabase(data);
  } catch (error) {
    console.error(`Error fetching stock ${symbol}:`, error);
    return null;
  }
};

// Get market indices
export const getIndices = async (): Promise<MarketIndex[]> => {
  try {
    const { data, error } = await supabase
      .from('market_indices')
      .select('*')
      .order('symbol');
    
    if (error) {
      console.error("Error fetching indices:", error);
      throw error;
    }
    
    return mapIndicesFromDatabase(data || []);
  } catch (error) {
    console.error("Error fetching indices:", error);
    return [];
  }
};

// Get chart data for a symbol
export const getChartData = async (symbol: string): Promise<ChartData[]> => {
  try {
    const { data, error } = await supabase
      .from('chart_data')
      .select('*')
      .eq('symbol', symbol)
      .order('timestamp');
    
    if (error) {
      console.error(`Error fetching chart data for ${symbol}:`, error);
      throw error;
    }
    
    return (data || []).map(item => ({
      timestamp: new Date(item.timestamp).getTime(),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume
    }));
  } catch (error) {
    console.error(`Error fetching chart data for ${symbol}:`, error);
    return [];
  }
};

// Get option chain for a symbol
export const getOptionChain = async (symbol: string): Promise<OptionChain | null> => {
  try {
    // Call our edge function
    const { data: result, error } = await supabase.functions.invoke('market-data', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: { action: 'options', symbol }
    });
    
    if (error) {
      console.error(`Error fetching option chain for ${symbol}:`, error);
      throw error;
    }
    
    return result as OptionChain;
  } catch (error) {
    console.error(`Error fetching option chain for ${symbol}:`, error);
    return null;
  }
};

// Helper function to fetch from our Edge Function
export const fetchFromEdgeFunction = async (action: string, params: Record<string, string> = {}) => {
  try {
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
};

// Helper functions to map database records to our types
function mapStockFromDatabase(data: any): Stock {
  return {
    symbol: data.symbol,
    name: data.name,
    price: data.price,
    change: data.change,
    changePercent: data.change_percent,
    high: data.high,
    low: data.low,
    open: data.open,
    close: data.close,
    volume: data.volume,
    marketCap: data.market_cap,
    sector: data.sector
  };
}

function mapStocksFromDatabase(data: any[]): Stock[] {
  return data.map(mapStockFromDatabase);
}

function mapIndicesFromDatabase(data: any[]): MarketIndex[] {
  return data.map(item => ({
    symbol: item.symbol,
    name: item.name,
    value: item.value,
    change: item.change,
    changePercent: item.change_percent,
    open: item.open,
    high: item.high,
    low: item.low
  }));
}
