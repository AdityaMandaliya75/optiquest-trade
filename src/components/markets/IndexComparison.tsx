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
        const indicesData = await getIndices();
        const allIndices = [...indicesData];
        
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
  
  const generateHistoricalData = (indices: MarketIndex[], interval: string): Array<{name: string, value: number}[]> => {
    const result: Array<{name: string, value: number}[]> = [];
    
    let dataPoints = 24;
    if (interval === '5d') dataPoints = 5;
    if (interval === '1m') dataPoints = 30;
    if (interval === '3m') dataPoints = 90;
    if (interval === '1y') dataPoints = 12;
    if (interval === 'all') dataPoints = 36;
    
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
          const date = new Date();
          date.setMonth(date.getMonth() - (dataPoints - i - 1));
          const year = date.getFullYear();
          const month = date.toLocaleDateString('en-US', { month: 'short' });
          timestamp = `${month} ${year}`;
        }
        
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
  
  const getPerformanceData = () => {
    return indices.map(index => ({
      name: index.symbol,
      change: index.changePercent,
      fillColor: index.changePercent >= 0 ? '#22c55e' : '#ef4444'
    }));
  };
  
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
                    margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      tickFormatter={(value) => `${value.toFixed(2)}%`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(2)}%`, 'Change']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar 
                      dataKey="change" 
                      radius={[4, 4, 0, 0]} 
                      barSize={20}
                      fill="#8884d8"
                      fillOpacity={0.8}
                      name="Change %"
                    >
                      {
                        getPerformanceData().map((entry, index) => (
                          <rect key={`rect-${index}`} fill={entry.fillColor} />
                        ))
                      }
                    </Bar>
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

const getIndexColor = (index: number): string => {
  const colors = [
    '#0ea5e9',
    '#f97316',
    '#22c55e',
    '#a855f7',
    '#ec4899',
    '#14b8a6',
    '#eab308',
    '#f43f5e',
  ];
  
  return colors[index % colors.length];
};

export default IndexComparison;
