
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MarketIndex } from '@/types/market';
import { getIndices } from '@/services/marketService';
import { getPriceChangeClass, formatPercent } from '@/lib/utils';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface IndexComparisonProps {
  interval: string;
  onIntervalChange?: (interval: string) => void;
}

const IndexComparison: React.FC<IndexComparisonProps> = ({ interval, onIntervalChange }) => {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [historicalData, setHistoricalData] = useState<Array<{name: string, value: number}[]>>([]);
  const [comparisonView, setComparisonView] = useState<'performance' | 'trend'>('performance');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchIndices = async () => {
      setLoading(true);
      try {
        // Get all indices available from NSE/BSE
        const indicesData = await getIndices();
        // Add additional indices that might not be included in the original data
        const allIndices = [...indicesData];
        
        // Add mock indices if they don't exist already
        const additionalIndices = [
          'NIFTY IT', 'NIFTY AUTO', 'NIFTY PHARMA', 'NIFTY BANK', 
          'NIFTY MIDCAP', 'NIFTY SMALLCAP', 'NIFTY FMCG', 'NIFTY METAL',
          'NIFTY REALTY', 'NIFTY ENERGY'
        ];
        
        additionalIndices.forEach(symbol => {
          if (!allIndices.some(index => index.symbol === symbol)) {
            allIndices.push({
              symbol,
              name: symbol,
              value: 10000 + Math.random() * 5000,
              open: 10000 + Math.random() * 5000,
              high: 10000 + Math.random() * 5000,
              low: 10000 + Math.random() * 5000,
              change: (Math.random() - 0.5) * 200,
              changePercent: (Math.random() - 0.5) * 4
            });
          }
        });
        
        setIndices(allIndices);
        
        // Generate mock historical data for each index
        // In a real app, this would come from an API based on the selected interval
        const mockHistorical = generateHistoricalData(allIndices, interval);
        setHistoricalData(mockHistorical);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching indices:', error);
        setLoading(false);
      }
    };
    
    fetchIndices();
  }, [interval]);
  
  // Generate mock historical data based on interval
  const generateHistoricalData = (indices: MarketIndex[], interval: string): Array<{name: string, value: number}[]> => {
    const result: Array<{name: string, value: number}[]> = [];
    
    // Number of data points based on interval
    let dataPoints = 24; // 1 day (hourly)
    if (interval === '5d') dataPoints = 5;
    if (interval === '1m') dataPoints = 30;
    if (interval === '3m') dataPoints = 90;
    if (interval === '1y') dataPoints = 12;
    if (interval === 'all') dataPoints = 36; // For "All" time - use 3 years of data
    
    indices.forEach(index => {
      const data: {name: string, value: number}[] = [];
      let lastValue = index.value - index.change;
      
      for (let i = 0; i < dataPoints; i++) {
        let timestamp: string;
        if (interval === '1d') {
          const hour = 9 + Math.floor(i / 4);
          const minute = (i % 4) * 15;
          timestamp = `${hour}:${minute.toString().padStart(2, '0')}`;
        } else if (['5d', '1m', '3m'].includes(interval)) {
          const date = new Date();
          date.setDate(date.getDate() - (dataPoints - i - 1));
          timestamp = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else if (interval === '1y') {
          const date = new Date();
          date.setMonth(date.getMonth() - (dataPoints - i - 1));
          timestamp = date.toLocaleDateString('en-US', { month: 'short' });
        } else {
          // For "All" time interval
          const date = new Date();
          date.setMonth(date.getMonth() - (dataPoints - i - 1));
          const year = date.getFullYear();
          const month = date.toLocaleDateString('en-US', { month: 'short' });
          timestamp = `${month} ${year}`;
        }
        
        // Generate a value with some randomness but trending toward the current value
        const progress = i / (dataPoints - 1);
        const randomFactor = (Math.random() - 0.5) * 0.01 * lastValue;
        const value = lastValue * (1 - progress) + index.value * progress + randomFactor;
        lastValue = value;
        
        data.push({
          name: timestamp,
          value: parseFloat(value.toFixed(2))
        });
      }
      
      result.push(data);
    });
    
    return result;
  };
  
  // Prepare data for the performance comparison bar chart with % gain on Y-axis and indices on X-axis
  const getPerformanceData = () => {
    return indices.map(index => ({
      name: index.symbol,
      change: index.changePercent,
      fill: index.changePercent >= 0 ? '#22c55e' : '#ef4444'
    }));
  };
  
  // Format trend data for the line chart
  const getTrendData = () => {
    if (historicalData.length === 0 || indices.length === 0) return [];
    
    const result: any[] = [];
    const maxLength = Math.max(...historicalData.map(data => data.length));
    
    for (let i = 0; i < maxLength; i++) {
      const dataPoint: any = { name: '' };
      
      indices.forEach((index, indexIdx) => {
        if (historicalData[indexIdx] && historicalData[indexIdx][i]) {
          dataPoint.name = historicalData[indexIdx][i].name;
          dataPoint[index.symbol] = historicalData[indexIdx][i].value;
        }
      });
      
      result.push(dataPoint);
    }
    
    return result;
  };
  
  // Get interval display text
  const getIntervalText = () => {
    switch(interval) {
      case '1d': return 'Today';
      case '5d': return 'Last 5 Days';
      case '1m': return 'Last Month';
      case '3m': return 'Last 3 Months';
      case '1y': return 'Last Year';
      case 'all': return 'All Time';
      default: return 'Today';
    }
  };
  
  // Handle interval change
  const handleIntervalClick = (newInterval: string) => {
    if (onIntervalChange) {
      onIntervalChange(newInterval);
    }
  };
  
  return (
    <Card className="border-slate-700 bg-slate-900">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            Market Indices Comparison
            <span className="ml-2 flex items-center text-sm font-normal text-gray-400">
              <Clock size={14} className="mr-1" />
              {getIntervalText()}
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Tabs 
              value={comparisonView} 
              onValueChange={(value) => setComparisonView(value as 'performance' | 'trend')}
              className="w-auto"
            >
              <TabsList className="h-8">
                <TabsTrigger value="performance" className="text-xs px-3 py-0.5 h-7">Performance</TabsTrigger>
                <TabsTrigger value="trend" className="text-xs px-3 py-0.5 h-7">Trend</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center text-xs bg-slate-800 rounded-lg overflow-hidden">
              {['1d', '5d', '1m', '3m', '1y', 'all'].map(option => (
                <button
                  key={option}
                  className={`px-2 py-1 ${interval === option ? 'bg-primary text-white' : 'text-gray-400'}`}
                  onClick={() => handleIntervalClick(option)}
                >
                  {option === 'all' ? 'All' : option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-sm text-gray-400">Loading index data...</p>
          </div>
        ) : (
          <>
            {comparisonView === 'performance' ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getPerformanceData()}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                    <XAxis 
                      type="number" 
                      domain={['auto', 'auto']} 
                      tickFormatter={(value) => `${value.toFixed(2)}%`}
                      stroke="#94a3b8"
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#94a3b8"
                      width={90}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(2)}%`, 'Change']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar 
                      dataKey="change" 
                      radius={[0, 4, 4, 0]} 
                      barSize={20}
                      fill={(entry) => entry.fill}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getTrendData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      tick={{ fontSize: 10 }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      formatter={(value: number) => [value.toFixed(2), '']}
                    />
                    <Legend />
                    {indices.slice(0, 10).map((index, i) => (
                      <Line
                        key={index.symbol}
                        type="monotone"
                        dataKey={index.symbol}
                        stroke={getIndexColor(i)}
                        dot={false}
                        strokeWidth={2}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {indices.map(index => (
                <div key={index.symbol} className="bg-slate-800 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400">{index.symbol}</div>
                  <div className="text-sm font-semibold">{index.value.toLocaleString()}</div>
                  <div className={`flex items-center justify-center text-xs ${getPriceChangeClass(index.change)}`}>
                    {index.change >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                    {formatPercent(index.changePercent)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to get different colors for each index line
const getIndexColor = (index: number): string => {
  const colors = [
    '#0ea5e9', // blue
    '#f97316', // orange
    '#22c55e', // green
    '#a855f7', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#eab308', // yellow
    '#f43f5e', // red
  ];
  
  return colors[index % colors.length];
};

export default IndexComparison;
