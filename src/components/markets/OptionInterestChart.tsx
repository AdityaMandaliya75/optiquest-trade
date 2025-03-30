
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { OptionInterestData } from '@/types/market';

interface OptionInterestChartProps {
  data: OptionInterestData[];
  underlyingPrice: number;
  timeLabel: string;
}

const OptionInterestChart: React.FC<OptionInterestChartProps> = ({ 
  data, 
  underlyingPrice,
  timeLabel
}) => {
  // Sort data by strike price
  const sortedData = [...data].sort((a, b) => a.strikePrice - b.strikePrice);
  
  // Format numbers with commas
  const formatNumber = (value: number) => value.toLocaleString();
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const strikePrice = label;
      const callOI = payload[0]?.value || 0;
      const putOI = payload[1]?.value || 0;
      const callChange = payload.find((p: any) => p.name === 'ceOiChange')?.value || 0;
      const putChange = payload.find((p: any) => p.name === 'peOiChange')?.value || 0;
      
      return (
        <div className="bg-slate-800 border border-slate-600 rounded p-2 text-xs shadow-lg">
          <p className="font-semibold mb-1">Strike: {strikePrice}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>
              <span className="text-cyan-400">Call OI:</span> {formatNumber(callOI)}
            </div>
            <div>
              <span className="text-red-400">Put OI:</span> {formatNumber(putOI)}
            </div>
            <div>
              <span className={`${callChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                Change: {callChange >= 0 ? '+' : ''}{formatNumber(callChange)}
              </span>
            </div>
            <div>
              <span className={`${putChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                Change: {putChange >= 0 ? '+' : ''}{formatNumber(putChange)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="border-slate-700 bg-slate-900">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Call vs Put OI</CardTitle>
          <div className="text-xs text-gray-400">
            As of <span className="font-medium text-primary">{timeLabel}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              barGap={0}
              barCategoryGap="15%"
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
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
                tickFormatter={(value) => value.toString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={0} stroke="#64748b" />
              <Bar dataKey="callOI" name="Call OI" fill="#0ea5e9" />
              <Bar dataKey="putOI" name="Put OI" fill="#ef4444" />
              <ReferenceLine 
                y={underlyingPrice.toString()} 
                stroke="#f59e0b" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                ifOverflow="extendDomain"
                label={{ 
                  value: `LTP: ${underlyingPrice}`, 
                  position: 'insideBottomRight',
                  fill: '#f59e0b',
                  fontSize: 10
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptionInterestChart;
