
import React, { useState } from 'react';
import { ChartData } from '@/types/market';
import { formatChartTime, formatNumber } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar 
} from 'recharts';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface StockChartProps {
  data: ChartData[];
  symbol: string;
  fullWidth?: boolean;
}

const intervalOptions = ['1d', '1w', '1m', '3m', '1y'];
type ChartType = 'area' | 'candle';

const StockChart: React.FC<StockChartProps> = ({ data, symbol, fullWidth = false }) => {
  const [interval, setInterval] = useState('1d');
  const [chartType, setChartType] = useState<ChartType>('area');
  
  const formatTooltip = (value: number) => {
    return formatNumber(value);
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border p-2 text-xs rounded-md shadow-lg">
          <p className="font-semibold">{formatChartTime(label)}</p>
          <p className="text-profit">Open: {formatNumber(payload[0].payload.open)}</p>
          <p className="text-profit">High: {formatNumber(payload[0].payload.high)}</p>
          <p className="text-loss">Low: {formatNumber(payload[0].payload.low)}</p>
          <p className={payload[0].payload.close >= payload[0].payload.open ? 'text-profit' : 'text-loss'}>
            Close: {formatNumber(payload[0].payload.close)}
          </p>
          <p>Volume: {formatNumber(payload[0].payload.volume)}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className={fullWidth ? "w-full" : ""}>
      <CardHeader className="pb-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle>{symbol} Price Chart</CardTitle>
          <div className="flex flex-wrap gap-2">
            <ToggleGroup type="single" value={interval} onValueChange={(value) => value && setInterval(value)}>
              {intervalOptions.map((option) => (
                <ToggleGroupItem key={option} value={option} size="sm">
                  {option}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            
            <ToggleGroup type="single" value={chartType} onValueChange={(value) => value && setChartType(value as ChartType)}>
              <ToggleGroupItem value="area" size="sm">Line</ToggleGroupItem>
              <ToggleGroupItem value="candle" size="sm">Candle</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f3652" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatChartTime}
                  stroke="#b0bec5"
                  tick={{ fill: '#b0bec5', fontSize: 11 }}
                />
                <YAxis 
                  tickFormatter={formatTooltip}
                  domain={['auto', 'auto']}
                  stroke="#b0bec5"
                  tick={{ fill: '#b0bec5', fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="close" 
                  stroke="#3B82F6" 
                  fillOpacity={1}
                  fill="url(#colorPrice)" 
                />
              </AreaChart>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="75%">
                  <AreaChart
                    data={data}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2f3652" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatChartTime}
                      stroke="#b0bec5"
                      tick={{ fill: '#b0bec5', fontSize: 11 }}
                    />
                    <YAxis 
                      tickFormatter={formatTooltip}
                      domain={['auto', 'auto']}
                      stroke="#b0bec5"
                      tick={{ fill: '#b0bec5', fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="close" 
                      stroke="#3B82F6" 
                      fillOpacity={1}
                      fill="url(#colorPrice)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
                
                <ResponsiveContainer width="100%" height="25%">
                  <BarChart
                    data={data}
                    margin={{
                      top: 0,
                      right: 10,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2f3652" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatChartTime}
                      stroke="#b0bec5"
                      tick={{ fill: '#b0bec5', fontSize: 9 }}
                    />
                    <YAxis
                      tickFormatter={(value) => formatNumber(value)}
                      stroke="#b0bec5"
                      tick={{ fill: '#b0bec5', fontSize: 9 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="volume"
                      fill="#4CAF50"
                      maxBarSize={5}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockChart;
