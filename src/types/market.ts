
// Market Data Types
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: number;
  marketCap: number;
  sector?: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
}

export interface OptionChain {
  underlyingSymbol: string;
  expiryDate: string;
  calls: Option[];
  puts: Option[];
}

export interface Option {
  strikePrice: number;
  expiryDate: string;
  type: 'call' | 'put';
  lastPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
}

export interface ChartData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Portfolio and Trading Types
export interface PortfolioHolding {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  instrumentType: 'stock' | 'option';
  optionDetails?: {
    strikePrice: number;
    expiryDate: string;
    type: 'call' | 'put';
  };
}

export interface Order {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  type: 'buy' | 'sell';
  status: 'open' | 'executed' | 'canceled';
  timestamp: number;
  instrumentType: 'stock' | 'option';
  optionDetails?: {
    strikePrice: number;
    expiryDate: string;
    type: 'call' | 'put';
  };
}

export interface TradeHistory {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  type: 'buy' | 'sell';
  timestamp: number;
  instrumentType: 'stock' | 'option';
  pnl?: number;
  optionDetails?: {
    strikePrice: number;
    expiryDate: string;
    type: 'call' | 'put';
  };
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvestment: number;
  todayPnL: number;
  totalPnL: number;
  totalPnLPercent: number;
}

// Watchlist Types
export interface Watchlist {
  id: string;
  name: string;
  stocks: WatchlistItem[];
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  addedAt: number;
  alerts?: WatchlistAlert[];
}

export interface WatchlistAlert {
  id: string;
  type: 'price' | 'change' | 'volume' | 'news';
  condition: 'above' | 'below' | 'percent_change' | 'news_mention';
  value: number | string;
  triggered: boolean;
  createdAt: number;
}

// News Types
export interface StockNews {
  id: string;
  headline: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: number;
  relatedSymbols: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  isImportant?: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'price_alert' | 'news_alert' | 'volume_spike' | 'system';
  title: string;
  message: string;
  timestamp: number;
  relatedSymbol?: string;
  read: boolean;
  isImportant: boolean;
}
