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
    // Here would be an API call to get real market news
    // For now, we'll use mock data
    const mockNews = getMockNews();
    
    // If a symbol is provided, filter news for that symbol
    if (symbol) {
      return mockNews.filter(news => 
        news.relatedSymbols.includes(symbol)
      );
    }
    
    return mockNews;
  } catch (error) {
    console.error('Error fetching market news:', error);
    // Return mock data as fallback
    const mockNews = getMockNews();
    if (symbol) {
      return mockNews.filter(news => 
        news.relatedSymbols.includes(symbol)
      );
    }
    return mockNews;
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

function getMockNews(): StockNews[] {
  return [
    {
      id: '1',
      headline: 'Reliance Industries to Invest ₹75,000 Crore in Green Energy',
      summary: 'Reliance Industries announced plans to invest ₹75,000 crore in green energy initiatives over the next three years, focusing on solar power, hydrogen, and fuel cells.',
      url: '#',
      source: 'Economic Times',
      publishedAt: Date.now() - 3600000,
      relatedSymbols: ['RELIANCE'],
      sentiment: 'positive' as const,
      isImportant: true
    },
    {
      id: '2',
      headline: 'HDFC Bank Reports 20% Increase in Q1 Profit',
      summary: 'HDFC Bank reported a 20% year-on-year increase in net profit for Q1 FY2024, beating market expectations. The bank also saw improvement in asset quality metrics.',
      url: '#',
      source: 'LiveMint',
      publishedAt: Date.now() - 7200000,
      relatedSymbols: ['HDFCBANK'],
      sentiment: 'positive' as const,
      isImportant: false
    },
    {
      id: '3',
      headline: 'Infosys Wins $1.5 Billion Deal from Global Financial Services Firm',
      summary: 'Infosys has secured a $1.5 billion deal from a leading global financial services company for digital transformation services spanning across 5 years.',
      url: '#',
      source: 'Business Standard',
      publishedAt: Date.now() - 10800000,
      relatedSymbols: ['INFY'],
      sentiment: 'positive' as const,
      isImportant: true
    },
    {
      id: '4',
      headline: 'TCS Partners with Microsoft for Cloud Solutions',
      summary: 'Tata Consultancy Services announced a strategic partnership with Microsoft to develop industry-specific cloud solutions targeting the banking and retail sectors.',
      url: '#',
      source: 'Financial Express',
      publishedAt: Date.now() - 14400000,
      relatedSymbols: ['TCS'],
      sentiment: 'positive' as const,
      isImportant: false
    },
    {
      id: '5',
      headline: 'Markets End Lower on Global Cues; IT, Bank Stocks Drag',
      summary: 'Indian benchmark indices ended lower, dragged by IT and banking stocks, following weak global cues and concerns about rising inflation.',
      url: '#',
      source: 'NDTV Profit',
      publishedAt: Date.now() - 18000000,
      relatedSymbols: ['NIFTY', 'BANKNIFTY'],
      sentiment: 'negative' as const,
      isImportant: false
    },
    {
      id: '6',
      headline: 'RBI Keeps Repo Rate Unchanged at 6.5% for Fourth Consecutive Time',
      summary: 'The Reserve Bank of India maintained the repo rate at 6.5% for the fourth consecutive policy meeting, in line with market expectations, while maintaining its withdrawal of accommodation stance.',
      url: '#',
      source: 'Bloomberg Quint',
      publishedAt: Date.now() - 86400000,
      relatedSymbols: ['NIFTY', 'BANKNIFTY', 'HDFCBANK', 'ICICIBANK', 'SBIN'],
      sentiment: 'neutral' as const,
      isImportant: true
    },
    {
      id: '7',
      headline: 'Wipro Announces Share Buyback Worth ₹10,000 Crore',
      summary: 'Wipro has announced a share buyback program worth ₹10,000 crore at ₹445 per share, representing a 16% premium to the current market price.',
      url: '#',
      source: 'Moneycontrol',
      publishedAt: Date.now() - 86400000 * 2,
      relatedSymbols: ['WIPRO'],
      sentiment: 'positive' as const,
      isImportant: true
    }
  ];
}
