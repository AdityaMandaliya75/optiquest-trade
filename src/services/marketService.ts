
import { Stock, MarketIndex, ChartData, OptionChain } from '@/types/market';
import { supabase } from '@/integrations/supabase/client';

// Get a list of stocks from Supabase
export const getStocks = async (): Promise<Stock[]> => {
  try {
    // First try to get from Supabase
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .order('symbol');
    
    if (error) throw error;
    
    if (data.length === 0) {
      // If no data in Supabase, fetch from our edge function
      await fetchFromEdgeFunction('marketSummary');
      await fetchFromEdgeFunction('trending');
      
      // Try again from Supabase
      const { data: refetchedData, error: refetchError } = await supabase
        .from('stocks')
        .select('*')
        .order('symbol');
      
      if (refetchError) throw refetchError;
      
      return mapStocksFromDatabase(refetchedData);
    }
    
    return mapStocksFromDatabase(data);
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return [];
  }
};

// Get a single stock by symbol
export const getStockBySymbol = async (symbol: string): Promise<Stock | null> => {
  try {
    // First try to get from Supabase
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .eq('symbol', symbol)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) {
      // If not in Supabase, fetch from our edge function
      await fetchFromEdgeFunction('quote', { symbol });
      
      // Try again from Supabase
      const { data: refetchedData, error: refetchError } = await supabase
        .from('stocks')
        .select('*')
        .eq('symbol', symbol)
        .maybeSingle();
      
      if (refetchError) throw refetchError;
      
      if (!refetchedData) return null;
      
      return mapStockFromDatabase(refetchedData);
    }
    
    return mapStockFromDatabase(data);
  } catch (error) {
    console.error(`Error fetching stock ${symbol}:`, error);
    return null;
  }
};

// Get market indices
export const getIndices = async (): Promise<MarketIndex[]> => {
  try {
    // First try to get from Supabase
    const { data, error } = await supabase
      .from('market_indices')
      .select('*')
      .order('symbol');
    
    if (error) throw error;
    
    if (data.length === 0) {
      // If no data in Supabase, fetch from our edge function
      await fetchFromEdgeFunction('marketSummary');
      
      // Try again from Supabase
      const { data: refetchedData, error: refetchError } = await supabase
        .from('market_indices')
        .select('*')
        .order('symbol');
      
      if (refetchError) throw refetchError;
      
      return mapIndicesFromDatabase(refetchedData);
    }
    
    return mapIndicesFromDatabase(data);
  } catch (error) {
    console.error("Error fetching indices:", error);
    return [];
  }
};

// Get chart data for a symbol
export const getChartData = async (symbol: string): Promise<ChartData[]> => {
  try {
    // First try to get from Supabase
    const { data, error } = await supabase
      .from('chart_data')
      .select('*')
      .eq('symbol', symbol)
      .order('timestamp');
    
    if (error) throw error;
    
    if (data.length === 0) {
      // If no data in Supabase, fetch directly from our edge function
      const result = await fetchFromEdgeFunction('chart', { symbol });
      return result as ChartData[];
    }
    
    return data.map(item => ({
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
    // Fetch from our edge function
    const result = await fetchFromEdgeFunction('options', { symbol });
    return result as OptionChain;
  } catch (error) {
    console.error(`Error fetching option chain for ${symbol}:`, error);
    return null;
  }
};

// Helper function to fetch from our Edge Function
async function fetchFromEdgeFunction(action: string, params: Record<string, string> = {}) {
  try {
    let url = `${supabase.supabaseUrl}/functions/v1/market-data?action=${action}`;
    
    // Add additional params
    Object.keys(params).forEach(key => {
      url += `&${key}=${encodeURIComponent(params[key])}`;
    });
    
    const { data: result } = await supabase.functions.invoke('market-data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      query: { action, ...params }
    });
    
    return result;
  } catch (error) {
    console.error(`Error calling edge function for ${action}:`, error);
    throw error;
  }
}

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
