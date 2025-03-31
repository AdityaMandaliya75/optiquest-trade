import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, BarChart2, BarChart3, Clock } from 'lucide-react';
import { OptionInterestData, TimelineData } from '@/types/market';
import { getMockOptionInterestData, getMockTimelineData } from '@/services/optionAnalyticsService';

interface OptionsAnalyticsPanelProps {
  symbol?: string;
  currentPrice?: number;
  selectedTime?: string;
}

const OptionsAnalyticsPanel: React.FC<OptionsAnalyticsPanelProps> = ({ 
  symbol = 'NIFTY', 
  currentPrice = 23500,
  selectedTime = '12:00'
}) => {
  const [activeTab, setActiveTab] = useState('trending-oi');
  const [strikeRange, setStrikeRange] = useState<'all' | 'atm' | 'otm' | 'itm'>('all');
  const [oiInterval, setOiInterval] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  const timelineData = getMockTimelineData();
  const optionData = getMockOptionInterestData(selectedTime, currentPrice);
  
  const getTrendingOIData = () => {
    const callTrending = [...optionData]
      .sort((a, b) => Math.abs(b.ceOiChange) - Math.abs(a.ceOiChange))
      .slice(0, 5)
      .map(item => ({
        strike: item.strikePrice,
        change: item.ceOiChange,
        type: 'Call',
        fill: item.ceOiChange >= 0 ? '#22c55e' : '#ef4444'
      }));
      
    const putTrending = [...optionData]
      .sort((a, b) => Math.abs(b.peOiChange) - Math.abs(a.peOiChange))
      .slice(0, 5)
      .map(item => ({
        strike: item.strikePrice,
        change: item.peOiChange,
        type: 'Put',
        fill: item.peOiChange >= 0 ? '#22c55e' : '#ef4444'
      }));
      
    return [...callTrending, ...putTrending].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 8);
  };
  
  const getPECERatioData = () => {
    return timelineData.map(item => ({
      time: item.time,
      ratio: (item.putOI / item.callOI).toFixed(2),
      value: parseFloat((item.putOI / item.callOI).toFixed(2))
    }));
  };
  
  const getMultiStrikeOIData = () => {
    const atmStrike = Math.round(currentPrice / 50) * 50;
    const strikes = [
      atmStrike - 200,
      atmStrike - 100,
      atmStrike - 50,
      atmStrike,
      atmStrike + 50,
      atmStrike + 100,
      atmStrike + 200
    ];
    
    return timelineData.map(item => {
      const result: any = { time: item.time };
      
      strikes.forEach(strike => {
        const multiplier = 1 + Math.sin((strike - atmStrike) / 100) * 0.5;
        result[`${strike}CE`] = Math.round(item.callOI * multiplier * (0.8 + Math.random() * 0.4));
        result[`${strike}PE`] = Math.round(item.putOI * multiplier * (0.8 + Math.random() * 0.4));
      });
      
      return result;
    });
  };
  
  const getOIIntervalData = () => {
    let intervals: string[] = [];
    let values: number[] = [];
    
    if (oiInterval === 'daily') {
      intervals = ['9:15', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '15:30'];
      values = [120000, 150000, 180000, 165000, 190000, 210000, 200000, 220000];
    } else if (oiInterval === 'weekly') {
      intervals = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      values = [180000, 190000, 220000, 250000, 210000];
    } else {
      intervals = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      values = [200000, 250000, 300000, 280000];
    }
    
    return intervals.map((interval, index) => ({
      interval,
      callOI: values[index],
      putOI: values[index] * (0.8 + Math.random() * 0.4),
    }));
  };
  
  const formatNumber = (value: number) => value.toLocaleString();
  
  const TrendingOITooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded p-2 text-xs shadow-lg">
          <p className="font-semibold mb-1">Strike: {payload[0].payload.strike}</p>
          <p className="text-slate-300">Type: {payload[0].payload.type}</p>
          <p className={`${payload[0].payload.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            Change: {payload[0].payload.change >= 0 ? '+' : ''}{formatNumber(payload[0].payload.change)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-slate-700 bg-slate-900">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Options Analytics</CardTitle>
          <div className="text-xs text-gray-400">
            {symbol} @ <span className="text-primary">{currentPrice}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="trending-oi" className="flex items-center">
              <TrendingUp className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Trending OI</span>
            </TabsTrigger>
            <TabsTrigger value="pe-ce-ratio" className="flex items-center">
              <Activity className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">PE-CE Ratio</span>
            </TabsTrigger>
            <TabsTrigger value="call-vs-put" className="flex items-center">
              <BarChart2 className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Call vs Put OI</span>
            </TabsTrigger>
            <TabsTrigger value="multi-strike" className="flex items-center">
              <BarChart3 className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Multi-Strike OI</span>
            </TabsTrigger>
            <TabsTrigger value="oi-interval" className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">OI Interval</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="trending-oi" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Top OI Changes</h3>
              <Select
                value={strikeRange}
                onValueChange={(value) => setStrikeRange(value as any)}
              >
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Strike Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Strikes</SelectItem>
                  <SelectItem value="atm">Around ATM</SelectItem>
                  <SelectItem value="otm">OTM Only</SelectItem>
                  <SelectItem value="itm">ITM Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getTrendingOIData()}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis 
                    type="number" 
                    stroke="#94a3b8"
                    tickFormatter={formatNumber}
                  />
                  <YAxis 
                    dataKey="strike" 
                    type="category" 
                    stroke="#94a3b8"
                    width={50}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip content={<TrendingOITooltip />} />
                  <Bar dataKey="change" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="pe-ce-ratio" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getPECERatioData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tick={{ fontSize: 10 }}
                    domain={[0, 'auto']}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${value}`, 'PE/CE Ratio']}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ stroke: '#f59e0b', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <ReferenceLine y={1} stroke="#64748b" strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-slate-800 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-400">Current Ratio</div>
                <div className="text-xl font-bold text-amber-500">
                  {(timelineData[timelineData.length-1]?.putOI / timelineData[timelineData.length-1]?.callOI).toFixed(2)}
                </div>
              </div>
              <div className="bg-slate-800 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-400">Call OI</div>
                <div className="text-xl font-semibold text-cyan-500">
                  {formatNumber(timelineData[timelineData.length-1]?.callOI)}
                </div>
              </div>
              <div className="bg-slate-800 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-400">Put OI</div>
                <div className="text-xl font-semibold text-red-500">
                  {formatNumber(timelineData[timelineData.length-1]?.putOI)}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="call-vs-put">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={optionData}
                  layout="vertical"
                  barGap={0}
                  barCategoryGap="15%"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    type="number" 
                    tickFormatter={formatNumber}
                    stroke="#94a3b8"
                  />
                  <YAxis 
                    dataKey="strikePrice" 
                    type="category" 
                    scale="band" 
                    stroke="#94a3b8"
                    width={50}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatNumber(value), '']}
                    labelFormatter={(label) => `Strike: ${label}`}
                  />
                  <ReferenceLine x={0} stroke="#64748b" />
                  <Bar dataKey="callOI" name="Call OI" fill="#0ea5e9" />
                  <Bar dataKey="putOI" name="Put OI" fill="#ef4444" />
                  <ReferenceLine 
                    y={currentPrice.toString()} 
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    label={{ 
                      value: `LTP: ${currentPrice}`, 
                      position: 'insideBottomRight',
                      fill: '#f59e0b',
                      fontSize: 10
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="multi-strike">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getMultiStrikeOIData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tick={{ fontSize: 10 }}
                    tickFormatter={formatNumber}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatNumber(value), '']}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Legend />
                  {Object.keys(getMultiStrikeOIData()[0] || {}).filter(key => key !== 'time').map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={key}
                      stroke={getStrikeColor(index)}
                      strokeWidth={key.includes(currentPrice.toString()) ? 2 : 1}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="oi-interval">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">OI Changes Over Time</h3>
              <Select
                value={oiInterval}
                onValueChange={(value) => setOiInterval(value as any)}
              >
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Time Interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily (Intraday)</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getOIIntervalData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="interval" 
                    stroke="#94a3b8"
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tickFormatter={formatNumber}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatNumber(value), '']}
                  />
                  <Legend />
                  <Bar dataKey="callOI" name="Call OI" fill="#0ea5e9" />
                  <Bar dataKey="putOI" name="Put OI" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const getStrikeColor = (index: number): string => {
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

export default OptionsAnalyticsPanel;
