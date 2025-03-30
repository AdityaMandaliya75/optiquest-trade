
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ExternalLink, Clock } from 'lucide-react';
import { StockNews } from '@/types/market';
import { getAllNews, getImportantNews } from '@/services/newsService';
import { formatDistanceToNow } from 'date-fns';

const NewsPanel: React.FC = () => {
  const [allNews, setAllNews] = useState<StockNews[]>([]);
  const [importantNews, setImportantNews] = useState<StockNews[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const [allNewsData, importantNewsData] = await Promise.all([
          getAllNews(),
          getImportantNews()
        ]);
        
        setAllNews(allNewsData);
        setImportantNews(importantNewsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };
    
    fetchNews();
  }, []);
  
  const filteredNews = searchQuery
    ? allNews.filter(
        news =>
          news.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
          news.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          news.relatedSymbols.some(symbol => 
            symbol.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : allNews;
  
  const renderNewsItem = (news: StockNews) => (
    <div key={news.id} className="border-b last:border-0 py-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-medium text-lg">{news.headline}</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {news.isImportant && (
              <Badge variant="destructive">Important</Badge>
            )}
            {news.sentiment === 'positive' && (
              <Badge className="bg-green-500">Positive</Badge>
            )}
            {news.sentiment === 'negative' && (
              <Badge className="bg-red-500">Negative</Badge>
            )}
            {news.sentiment === 'neutral' && (
              <Badge variant="outline">Neutral</Badge>
            )}
            <Badge variant="outline">{news.source}</Badge>
          </div>
          <p className="text-muted-foreground mt-2">{news.summary}</p>
          <div className="flex items-center mt-2 gap-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {formatDistanceToNow(news.publishedAt, { addSuffix: true })}
            </div>
            <div className="flex flex-wrap gap-1">
              {news.relatedSymbols.map(symbol => (
                <Badge key={symbol} variant="secondary" className="text-xs">
                  {symbol}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <Button size="sm" variant="ghost" className="shrink-0">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Market News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">Loading news...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Market News</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto pb-6">
        <div className="relative w-full mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search news by stock, keyword..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All News</TabsTrigger>
            <TabsTrigger value="important">Important</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-0 -mt-2">
            {filteredNews.length === 0 ? (
              <div className="flex items-center justify-center h-48">
                <p className="text-muted-foreground">No news found</p>
              </div>
            ) : (
              <div className="space-y-0 divide-y">
                {filteredNews.map(renderNewsItem)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="important" className="space-y-0 -mt-2">
            {importantNews.length === 0 ? (
              <div className="flex items-center justify-center h-48">
                <p className="text-muted-foreground">No important news</p>
              </div>
            ) : (
              <div className="space-y-0 divide-y">
                {importantNews.map(renderNewsItem)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NewsPanel;
