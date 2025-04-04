
import { StockNews } from '@/types/market';
import { getMarketNews } from './marketService';

// Get all news
export const getAllNews = async (): Promise<StockNews[]> => {
  try {
    const news = await getMarketNews();
    return news || getMockNews();
  } catch (error) {
    console.error('Error fetching all news:', error);
    return getMockNews();
  }
};

// Get news for a specific stock
export const getNewsForStock = async (symbol: string): Promise<StockNews[]> => {
  try {
    const news = await getMarketNews(symbol);
    return news || getMockNewsForStock(symbol);
  } catch (error) {
    console.error(`Error fetching news for stock ${symbol}:`, error);
    return getMockNewsForStock(symbol);
  }
};

// Get important news
export const getImportantNews = async (): Promise<StockNews[]> => {
  try {
    const allNews = await getMarketNews();
    const important = allNews?.filter(news => news.isImportant) || [];
    return important.length > 0 ? important : getMockNews().filter(news => news.isImportant);
  } catch (error) {
    console.error('Error fetching important news:', error);
    return getMockNews().filter(news => news.isImportant);
  }
};

// Get latest news
export const getLatestNews = async (limit: number = 5): Promise<StockNews[]> => {
  try {
    const allNews = await getMarketNews();
    if (!allNews || allNews.length === 0) {
      return getMockNews().slice(0, limit);
    }
    
    return [...allNews]
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching latest news:', error);
    return getMockNews().slice(0, limit);
  }
};

// Mock news data as fallback
export function getMockNews(): StockNews[] {
  return [
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
      sentiment: 'positive',
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
      sentiment: 'positive',
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
      sentiment: 'negative',
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
}

export function getMockNewsForStock(symbol: string): StockNews[] {
  // Filter mock news to return only those related to the specified symbol
  return getMockNews().filter(news => 
    news.relatedSymbols.includes(symbol)
  );
}
