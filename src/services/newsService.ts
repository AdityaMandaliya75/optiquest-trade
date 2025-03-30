
import { StockNews } from '@/types/market';

// Mock news data
const mockNews: StockNews[] = [
  {
    id: '1',
    headline: 'Reliance Industries to Invest ₹75,000 Crore in Green Energy',
    summary: 'Reliance Industries announced plans to invest ₹75,000 crore in green energy initiatives over the next three years, focusing on solar power, hydrogen, and fuel cells.',
    url: '#',
    source: 'Economic Times',
    publishedAt: Date.now() - 3600000,
    relatedSymbols: ['RELIANCE'],
    sentiment: 'positive',
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
    sentiment: 'positive'
  },
  {
    id: '3',
    headline: 'Infosys Wins $1.5 Billion Deal from Global Financial Services Firm',
    summary: 'Infosys has secured a $1.5 billion deal from a leading global financial services company for digital transformation services spanning across 5 years.',
    url: '#',
    source: 'Business Standard',
    publishedAt: Date.now() - 10800000,
    relatedSymbols: ['INFY'],
    sentiment: 'positive',
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
    sentiment: 'positive'
  },
  {
    id: '5',
    headline: 'Markets End Lower on Global Cues; IT, Bank Stocks Drag',
    summary: 'Indian benchmark indices ended lower, dragged by IT and banking stocks, following weak global cues and concerns about rising inflation.',
    url: '#',
    source: 'NDTV Profit',
    publishedAt: Date.now() - 18000000,
    relatedSymbols: ['NIFTY', 'BANKNIFTY'],
    sentiment: 'negative'
  },
  {
    id: '6',
    headline: 'RBI Keeps Repo Rate Unchanged at 6.5% for Fourth Consecutive Time',
    summary: 'The Reserve Bank of India maintained the repo rate at 6.5% for the fourth consecutive policy meeting, in line with market expectations, while maintaining its withdrawal of accommodation stance.',
    url: '#',
    source: 'Bloomberg Quint',
    publishedAt: Date.now() - 86400000,
    relatedSymbols: ['NIFTY', 'BANKNIFTY', 'HDFCBANK', 'ICICIBANK', 'SBIN'],
    sentiment: 'neutral',
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
    sentiment: 'positive',
    isImportant: true
  }
];

// Get all news
export const getAllNews = (): Promise<StockNews[]> => {
  return Promise.resolve([...mockNews].sort((a, b) => b.publishedAt - a.publishedAt));
};

// Get news for a specific stock
export const getNewsForStock = (symbol: string): Promise<StockNews[]> => {
  const stockNews = mockNews.filter(news => 
    news.relatedSymbols.includes(symbol)
  ).sort((a, b) => b.publishedAt - a.publishedAt);
  
  return Promise.resolve(stockNews);
};

// Get important news
export const getImportantNews = (): Promise<StockNews[]> => {
  const importantNews = mockNews.filter(news => news.isImportant)
    .sort((a, b) => b.publishedAt - a.publishedAt);
  
  return Promise.resolve(importantNews);
};

// Get latest news
export const getLatestNews = (limit: number = 5): Promise<StockNews[]> => {
  return Promise.resolve(
    [...mockNews]
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .slice(0, limit)
  );
};
