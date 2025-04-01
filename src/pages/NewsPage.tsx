
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import NewsPanel from '@/components/news/NewsPanel';
import { Card, CardContent } from '@/components/ui/card';
import { getAllNews, getImportantNews } from '@/services/newsService';
import { StockNews } from '@/types/market';
import { useToast } from '@/hooks/use-toast';

const NewsPage: React.FC = () => {
  const [allNews, setAllNews] = useState<StockNews[]>([]);
  const [importantNews, setImportantNews] = useState<StockNews[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const [allNewsData, importantNewsData] = await Promise.all([
          getAllNews(),
          getImportantNews()
        ]);
        
        setAllNews(allNewsData);
        setImportantNews(importantNewsData);
      } catch (error) {
        console.error('Error fetching news:', error);
        toast({
          title: "Error",
          description: "Could not fetch latest news. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
    
    // Set up a polling interval to refresh news every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [toast]);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Market News</h1>
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading market news...</p>
            </CardContent>
          </Card>
        ) : (
          <NewsPanel allNews={allNews} importantNews={importantNews} />
        )}
      </div>
    </Layout>
  );
};

export default NewsPage;
