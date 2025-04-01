
import { Stock, MarketIndex, ChartData, OptionChain, StockNews } from '@/types/market';
import { supabase } from '@/integrations/supabase/client';

// Get a list of stocks from Supabase
export const getStocks = async (): Promise<Stock[]> => {
  try {
    // First attempt to fetch from external API via edge function
    try {
      const { data: result, error } = await supabase.functions.invoke('market-data', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: { action: 'trending' }
      });
      
      if (error) throw error;
      if (result && Array.isArray(result) && result.length > 0) {
        return result as Stock[];
      }
    } catch (apiError) {
      console.error("Error fetching stocks from external API:", apiError);
      // Fall back to database if API call fails
    }
    
    // Fallback to database
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
    // Return mock data as final fallback
    return getMockStocks();
  }
};

// Get a single stock by symbol
export const getStockBySymbol = async (symbol: string): Promise<Stock | null> => {
  try {
    // First try to fetch from external API
    try {
      const { data: result, error } = await supabase.functions.invoke('market-data', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: { action: 'quote', symbol }
      });
      
      if (error) throw error;
      if (result && Array.isArray(result) && result.length > 0) {
        return result[0] as Stock;
      }
    } catch (apiError) {
      console.error(`Error fetching stock ${symbol} from external API:`, apiError);
      // Fall back to database if API call fails
    }
    
    // Fallback to database
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
    // Return mock data for the symbol as final fallback
    return getMockStockBySymbol(symbol);
  }
};

// Get market indices
export const getIndices = async (): Promise<MarketIndex[]> => {
  try {
    // First try to fetch from external API
    try {
      const { data: result, error } = await supabase.functions.invoke('market-data', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: { action: 'marketSummary' }
      });
      
      if (error) throw error;
      if (result && Array.isArray(result) && result.length > 0) {
        return result as MarketIndex[];
      }
    } catch (apiError) {
      console.error("Error fetching indices from external API:", apiError);
      // Fall back to database if API call fails
    }
    
    // Fallback to database
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
    // Return mock data as final fallback
    return getMockIndices();
  }
};

// Get chart data for a symbol
export const getChartData = async (symbol: string): Promise<ChartData[]> => {
  try {
    // First try to fetch from external API
    try {
      const { data: result, error } = await supabase.functions.invoke('market-data', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: { action: 'chart', symbol, interval: '1d', range: '1mo' }
      });
      
      if (error) throw error;
      if (result && Array.isArray(result) && result.length > 0) {
        return result as ChartData[];
      }
    } catch (apiError) {
      console.error(`Error fetching chart data for ${symbol} from external API:`, apiError);
      // Fall back to database if API call fails
    }
    
    // Fallback to database
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
    // Return mock data as final fallback
    return getMockChartData(symbol);
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
    // Return mock data as final fallback
    return getMockOptionChain(symbol);
  }
};

// Get news data, either for a specific symbol or general market news
export const getMarketNews = async (symbol?: string): Promise<StockNews[]> => {
  try {
    // First try to fetch from external API
    try {
      const { data: result, error } = await supabase.functions.invoke('market-data', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: { action: 'news', symbol }
      });
      
      if (error) throw error;
      if (result && Array.isArray(result) && result.length > 0) {
        return result as StockNews[];
      }
    } catch (apiError) {
      console.error(`Error fetching news from external API:`, apiError);
      // Fall back to database if API call fails
    }
    
    // Fallback to database
    let query = supabase
      .from('news')
      .select(`
        *,
        news_stocks!inner(symbol)
      `)
      .order('published_at', { ascending: false });
    
    if (symbol) {
      query = query.eq('news_stocks.symbol', symbol);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching news:`, error);
      throw error;
    }
    
    return data.map(item => ({
      id: item.id,
      headline: item.headline,
      summary: item.summary,
      url: item.url,
      source: item.source,
      publishedAt: new Date(item.published_at).getTime(),
      relatedSymbols: item.news_stocks.map((ns: any) => ns.symbol),
      sentiment: item.sentiment,
      isImportant: item.is_important
    }));
  } catch (error) {
    console.error(`Error fetching news:`, error);
    // Return mock data as final fallback
    return getMockNews(symbol);
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

// Fetch external stock data (Yahoo Finance or other API)
export const fetchExternalMarketData = async () => {
  try {
    return await fetchFromEdgeFunction('external-market-data');
  } catch (error) {
    console.error("Error fetching external market data:", error);
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

// Mock data functions as final fallbacks
function getMockStocks(): Stock[] {
  return [
    {
      symbol: 'AAPL',
      name: 'Apple Inc',
      price: 175.32,
      change: 0.85,
      changePercent: 0.49,
      high: 176.1,
      low: 174.5,
      open: 174.8,
      close: 174.47,
      volume: 45871200,
      marketCap: 2750000000000,
      sector: 'Technology'
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 338.11,
      change: 2.23,
      changePercent: 0.66,
      high: 339.04,
      low: 335.28,
      open: 336.05,
      close: 335.88,
      volume: 22331400,
      marketCap: 2520000000000,
      sector: 'Technology'
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc',
      price: 137.14,
      change: -0.36,
      changePercent: -0.26,
      high: 138.02,
      low: 136.29,
      open: 137.77,
      close: 137.5,
      volume: 26042400,
      marketCap: 1720000000000,
      sector: 'Technology'
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc',
      price: 132.77,
      change: 1.78,
      changePercent: 1.36,
      high: 133.47,
      low: 130.94,
      open: 131.15,
      close: 130.99,
      volume: 46735500,
      marketCap: 1370000000000,
      sector: 'Consumer Cyclical'
    },
    {
      symbol: 'META',
      name: 'Meta Platforms Inc',
      price: 326.49,
      change: 4.83,
      changePercent: 1.50,
      high: 328.42,
      low: 321.85,
      open: 322.53,
      close: 321.66,
      volume: 15847300,
      marketCap: 835000000000,
      sector: 'Technology'
    }
  ];
}

function getMockStockBySymbol(symbol: string): Stock | null {
  const stocks = getMockStocks();
  const stock = stocks.find(s => s.symbol === symbol);
  return stock || null;
}

function getMockIndices(): MarketIndex[] {
  return [
    {
      symbol: '^GSPC',
      name: 'S&P 500',
      value: 4783.45,
      change: 25.34,
      changePercent: 0.53,
      open: 4758.11,
      high: 4784.58,
      low: 4752.99
    },
    {
      symbol: '^DJI',
      name: 'Dow Jones',
      value: 37658.17,
      change: 123.89,
      changePercent: 0.33,
      open: 37534.28,
      high: 37669.42,
      low: 37498.63
    },
    {
      symbol: '^IXIC',
      name: 'NASDAQ',
      value: 15055.65,
      change: 115.43,
      changePercent: 0.77,
      open: 14940.22,
      high: 15058.33,
      low: 14925.89
    }
  ];
}

function getMockChartData(symbol: string): ChartData[] {
  const data: ChartData[] = [];
  const now = new Date();
  const basePrice = symbol === 'AAPL' ? 175 : 
                   symbol === 'MSFT' ? 338 : 
                   symbol === 'GOOGL' ? 137 :
                   symbol === 'AMZN' ? 133 : 130;
  
  // Generate 30 days of mock data
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(16, 0, 0, 0);
    
    const volatility = 0.02; // 2% volatility
    const changePercent = (Math.random() * 2 - 1) * volatility;
    const change = basePrice * changePercent;
    const close = basePrice + change * (30 - i) / 10;
    const open = close - change;
    const high = Math.max(open, close) + Math.random() * Math.abs(change);
    const low = Math.min(open, close) - Math.random() * Math.abs(change);
    const volume = Math.floor(1000000 + Math.random() * 10000000);
    
    data.push({
      timestamp: date.getTime(),
      open,
      high,
      low,
      close,
      volume
    });
  }
  
  return data;
}

function getMockOptionChain(symbol: string): OptionChain {
  const stock = getMockStockBySymbol(symbol);
  const basePrice = stock?.price || 100;
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  const expiryDate = date.toISOString().split('T')[0];
  
  const calls = [];
  const puts = [];
  
  // Generate options at different strike prices
  for (let i = -5; i <= 5; i++) {
    const strikePrice = Math.round(basePrice * (1 + i * 0.05) * 100) / 100;
    const callPrice = Math.max(basePrice - strikePrice, 0) + Math.random() * 5;
    const putPrice = Math.max(strikePrice - basePrice, 0) + Math.random() * 5;
    
    calls.push({
      strikePrice,
      expiryDate,
      type: 'call' as const,
      lastPrice: parseFloat(callPrice.toFixed(2)),
      change: parseFloat((Math.random() * 2 - 1).toFixed(2)),
      changePercent: parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
      volume: Math.floor(100 + Math.random() * 1000),
      openInterest: Math.floor(500 + Math.random() * 2000),
      impliedVolatility: parseFloat((0.2 + Math.random() * 0.3).toFixed(2))
    });
    
    puts.push({
      strikePrice,
      expiryDate,
      type: 'put' as const,
      lastPrice: parseFloat(putPrice.toFixed(2)),
      change: parseFloat((Math.random() * 2 - 1).toFixed(2)),
      changePercent: parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
      volume: Math.floor(100 + Math.random() * 1000),
      openInterest: Math.floor(500 + Math.random() * 2000),
      impliedVolatility: parseFloat((0.2 + Math.random() * 0.3).toFixed(2))
    });
  }
  
  return {
    underlyingSymbol: symbol,
    underlyingPrice: basePrice,
    expiryDate,
    calls,
    puts
  };
}

function getMockNews(symbol?: string): StockNews[] {
  const baseNews: StockNews[] = [
    {
      id: '1',
      headline: 'Markets Rally as Fed Signals Potential Rate Cuts',
      summary: 'Global markets surged after Federal Reserve officials hinted at potential interest rate cuts later this year, citing improving inflation data and economic stability.',
      url: '#',
      source: 'Financial Times',
      publishedAt: Date.now() - 3600000,
      relatedSymbols: ['^GSPC', '^DJI', '^IXIC'],
      sentiment: 'positive',
      isImportant: true
    },
    {
      id: '2',
      headline: 'Apple Announces New iPhone Launch Event',
      summary: 'Apple Inc. has sent out invitations for its annual product launch event, where it is expected to unveil the next generation of iPhones and other devices.',
      url: '#',
      source: 'TechCrunch',
      publishedAt: Date.now() - 7200000,
      relatedSymbols: ['AAPL'],
      sentiment: 'positive',
      isImportant: true
    },
    {
      id: '3',
      headline: 'Microsoft Cloud Revenue Beats Expectations',
      summary: 'Microsoft reported stronger-than-expected cloud services growth in its latest earnings report, with Azure revenue up 27% year-over-year.',
      url: '#',
      source: 'Bloomberg',
      publishedAt: Date.now() - 10800000,
      relatedSymbols: ['MSFT'],
      sentiment: 'positive'
    },
    {
      id: '4',
      headline: 'Amazon Expands One-Day Delivery to More Markets',
      summary: 'Amazon announced an expansion of its one-day delivery service to additional cities, intensifying competition in the e-commerce space.',
      url: '#',
      source: 'Reuters',
      publishedAt: Date.now() - 14400000,
      relatedSymbols: ['AMZN'],
      sentiment: 'positive'
    },
    {
      id: '5',
      headline: 'Google Faces New Antitrust Challenge in EU',
      summary: 'European regulators have opened a new investigation into Google\'s advertising practices, potentially leading to additional fines for the tech giant.',
      url: '#',
      source: 'Wall Street Journal',
      publishedAt: Date.now() - 18000000,
      relatedSymbols: ['GOOGL'],
      sentiment: 'negative',
      isImportant: true
    }
  ];
  
  if (symbol) {
    return baseNews.filter(news => news.relatedSymbols.includes(symbol));
  }
  
  return baseNews;
}
