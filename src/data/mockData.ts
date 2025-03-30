
import { Stock, MarketIndex, OptionChain, ChartData, PortfolioHolding, Order, TradeHistory } from '../types/market';

// Mock NSE Stocks
export const mockStocks: Stock[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    price: 2856.75,
    change: 24.30,
    changePercent: 0.86,
    high: 2870.15,
    low: 2830.05,
    open: 2834.50,
    close: 2832.45,
    volume: 3789542,
    marketCap: 1932562000000,
    sector: 'Oil & Gas'
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    price: 3568.20,
    change: -15.75,
    changePercent: -0.44,
    high: 3590.45,
    low: 3552.10,
    open: 3582.25,
    close: 3583.95,
    volume: 1245678,
    marketCap: 1253647000000,
    sector: 'IT'
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    price: 1678.35,
    change: 12.85,
    changePercent: 0.77,
    high: 1689.90,
    low: 1668.50,
    open: 1670.60,
    close: 1665.50,
    volume: 3257896,
    marketCap: 978562000000,
    sector: 'Banking'
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    price: 1456.90,
    change: -8.45,
    changePercent: -0.58,
    high: 1470.25,
    low: 1450.30,
    open: 1468.45,
    close: 1465.35,
    volume: 2458761,
    marketCap: 652345000000,
    sector: 'IT'
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd.',
    price: 1043.25,
    change: 7.60,
    changePercent: 0.73,
    high: 1048.45,
    low: 1035.70,
    open: 1038.50,
    close: 1035.65,
    volume: 2896541,
    marketCap: 745896000000,
    sector: 'Banking'
  },
  {
    symbol: 'HINDUNILVR',
    name: 'Hindustan Unilever Ltd.',
    price: 2367.80,
    change: -3.25,
    changePercent: -0.14,
    high: 2378.45,
    low: 2360.15,
    open: 2370.25,
    close: 2371.05,
    volume: 1045672,
    marketCap: 523678000000,
    sector: 'FMCG'
  },
  {
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance Ltd.',
    price: 6789.45,
    change: 56.80,
    changePercent: 0.84,
    high: 6820.15,
    low: 6740.50,
    open: 6745.75,
    close: 6732.65,
    volume: 856932,
    marketCap: 369875000000,
    sector: 'Finance'
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    price: 943.60,
    change: 11.25,
    changePercent: 1.21,
    high: 947.85,
    low: 935.40,
    open: 936.50,
    close: 932.35,
    volume: 1759634,
    marketCap: 546879000000,
    sector: 'Telecom'
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    price: 875.30,
    change: -4.65,
    changePercent: -0.53,
    high: 882.40,
    low: 872.15,
    open: 880.25,
    close: 879.95,
    volume: 3498761,
    marketCap: 289765000000,
    sector: 'Automobile'
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    price: 743.90,
    change: 9.85,
    changePercent: 1.34,
    high: 748.25,
    low: 736.40,
    open: 738.55,
    close: 734.05,
    volume: 4789562,
    marketCap: 654789000000,
    sector: 'Banking'
  }
];

// Mock Market Indices
export const mockIndices: MarketIndex[] = [
  {
    symbol: 'NIFTY50',
    name: 'Nifty 50',
    value: 21643.75,
    change: 157.30,
    changePercent: 0.72,
    open: 21510.25,
    high: 21685.40,
    low: 21496.50
  },
  {
    symbol: 'BANKNIFTY',
    name: 'Nifty Bank',
    value: 47893.20,
    change: 342.65,
    changePercent: 0.76,
    open: 47625.45,
    high: 47975.10,
    low: 47590.75
  },
  {
    symbol: 'NIFTYIT',
    name: 'Nifty IT',
    value: 37824.50,
    change: -289.80,
    changePercent: -0.76,
    open: 38044.35,
    high: 38125.90,
    low: 37780.15
  },
  {
    symbol: 'SENSEX',
    name: 'BSE Sensex',
    value: 71785.30,
    change: 458.95,
    changePercent: 0.64,
    open: 71410.25,
    high: 71845.70,
    low: 71385.40
  }
];

// Mock Option Chain for Reliance
export const mockOptionChain: OptionChain = {
  underlyingSymbol: 'RELIANCE',
  expiryDate: '2023-11-30',
  calls: [
    {
      strikePrice: 2800,
      expiryDate: '2023-11-30',
      type: 'call',
      lastPrice: 75.45,
      change: 12.35,
      changePercent: 19.58,
      volume: 12456,
      openInterest: 5678,
      impliedVolatility: 22.5
    },
    {
      strikePrice: 2850,
      expiryDate: '2023-11-30',
      type: 'call',
      lastPrice: 45.20,
      change: 9.75,
      changePercent: 27.45,
      volume: 18765,
      openInterest: 7890,
      impliedVolatility: 21.8
    },
    {
      strikePrice: 2900,
      expiryDate: '2023-11-30',
      type: 'call',
      lastPrice: 25.85,
      change: 5.60,
      changePercent: 27.65,
      volume: 14523,
      openInterest: 6543,
      impliedVolatility: 20.4
    }
  ],
  puts: [
    {
      strikePrice: 2800,
      expiryDate: '2023-11-30',
      type: 'put',
      lastPrice: 23.65,
      change: -7.80,
      changePercent: -24.83,
      volume: 9876,
      openInterest: 4567,
      impliedVolatility: 23.2
    },
    {
      strikePrice: 2850,
      expiryDate: '2023-11-30',
      type: 'put',
      lastPrice: 38.90,
      change: -6.25,
      changePercent: -13.84,
      volume: 8765,
      openInterest: 5432,
      impliedVolatility: 22.1
    },
    {
      strikePrice: 2900,
      expiryDate: '2023-11-30',
      type: 'put',
      lastPrice: 62.45,
      change: -4.30,
      changePercent: -6.44,
      volume: 7654,
      openInterest: 3456,
      impliedVolatility: 24.7
    }
  ]
};

// Mock Chart Data for Reliance (1-day, 5-min intervals)
export const mockChartData: ChartData[] = Array(78).fill(null).map((_, index) => {
  const baseTime = new Date('2023-11-15T09:15:00').getTime();
  const timestamp = baseTime + index * 5 * 60 * 1000; // 5-minute intervals
  
  const basePrice = 2830 + Math.sin(index / 10) * 40;
  const variation = Math.random() * 10 - 5;
  
  const open = basePrice + variation;
  const close = open + (Math.random() * 10 - 5);
  const high = Math.max(open, close) + Math.random() * 5;
  const low = Math.min(open, close) - Math.random() * 5;
  const volume = Math.floor(Math.random() * 50000 + 10000);
  
  return { timestamp, open, high, low, close, volume };
});

// Mock Portfolio Holdings
export const mockPortfolioHoldings: PortfolioHolding[] = [
  {
    symbol: 'RELIANCE',
    quantity: 10,
    avgPrice: 2800.50,
    currentPrice: 2856.75,
    pnl: (2856.75 - 2800.50) * 10,
    pnlPercent: ((2856.75 - 2800.50) / 2800.50) * 100,
    instrumentType: 'stock'
  },
  {
    symbol: 'TCS',
    quantity: 5,
    avgPrice: 3550.25,
    currentPrice: 3568.20,
    pnl: (3568.20 - 3550.25) * 5,
    pnlPercent: ((3568.20 - 3550.25) / 3550.25) * 100,
    instrumentType: 'stock'
  },
  {
    symbol: 'RELIANCE',
    quantity: 2,
    avgPrice: 35.75,
    currentPrice: 45.20,
    pnl: (45.20 - 35.75) * 2,
    pnlPercent: ((45.20 - 35.75) / 35.75) * 100,
    instrumentType: 'option',
    optionDetails: {
      strikePrice: 2850,
      expiryDate: '2023-11-30',
      type: 'call'
    }
  }
];

// Mock Order History
export const mockOrders: Order[] = [
  {
    id: 'ORD123456',
    symbol: 'RELIANCE',
    quantity: 10,
    price: 2800.50,
    type: 'buy',
    status: 'executed',
    timestamp: new Date('2023-11-10T10:23:45').getTime(),
    instrumentType: 'stock'
  },
  {
    id: 'ORD123457',
    symbol: 'TCS',
    quantity: 5,
    price: 3550.25,
    type: 'buy',
    status: 'executed',
    timestamp: new Date('2023-11-12T11:15:30').getTime(),
    instrumentType: 'stock'
  },
  {
    id: 'ORD123458',
    symbol: 'RELIANCE',
    quantity: 2,
    price: 35.75,
    type: 'buy',
    status: 'executed',
    timestamp: new Date('2023-11-14T09:45:20').getTime(),
    instrumentType: 'option',
    optionDetails: {
      strikePrice: 2850,
      expiryDate: '2023-11-30',
      type: 'call'
    }
  }
];

// Mock Trade History
export const mockTradeHistory: TradeHistory[] = [
  {
    id: 'TRD123456',
    symbol: 'INFY',
    quantity: 8,
    price: 1445.30,
    type: 'buy',
    timestamp: new Date('2023-11-05T10:15:30').getTime(),
    instrumentType: 'stock'
  },
  {
    id: 'TRD123457',
    symbol: 'INFY',
    quantity: 8,
    price: 1460.75,
    type: 'sell',
    timestamp: new Date('2023-11-08T14:30:45').getTime(),
    instrumentType: 'stock',
    pnl: (1460.75 - 1445.30) * 8
  },
  {
    id: 'TRD123458',
    symbol: 'HDFCBANK',
    quantity: 3,
    price: 22.45,
    type: 'buy',
    timestamp: new Date('2023-11-07T11:20:15').getTime(),
    instrumentType: 'option',
    optionDetails: {
      strikePrice: 1650,
      expiryDate: '2023-11-30',
      type: 'put'
    }
  },
  {
    id: 'TRD123459',
    symbol: 'HDFCBANK',
    quantity: 3,
    price: 18.60,
    type: 'sell',
    timestamp: new Date('2023-11-09T15:45:30').getTime(),
    instrumentType: 'option',
    pnl: (18.60 - 22.45) * 3,
    optionDetails: {
      strikePrice: 1650,
      expiryDate: '2023-11-30',
      type: 'put'
    }
  }
];

// Mock Portfolio Summary
export const mockPortfolioSummary = {
  totalValue: 47987.25,
  totalInvestment: 47505.00,
  todayPnL: 256.75,
  totalPnL: 482.25,
  totalPnLPercent: 1.02
};
