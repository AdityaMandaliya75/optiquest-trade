
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import WatchlistPanel from '@/components/watchlist/WatchlistPanel';
import { Stock } from '@/types/market';
import { getStocks } from '@/services/marketService';

const WatchlistPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const data = await getStocks();
        setStocks(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setLoading(false);
      }
    };
    
    fetchStocks();
  }, []);
  
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Watchlists</h1>
        
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-lg text-muted-foreground">Loading stocks...</p>
          </div>
        ) : (
          <WatchlistPanel stocks={stocks} />
        )}
      </div>
    </Layout>
  );
};

export default WatchlistPage;
