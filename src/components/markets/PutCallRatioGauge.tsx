
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { PutCallRatioData } from '@/types/market';

interface PutCallRatioGaugeProps {
  data: PutCallRatioData;
  historyData: PutCallRatioData[];
}

const PutCallRatioGauge: React.FC<PutCallRatioGaugeProps> = ({ data, historyData }) => {
  const { ratio, netChange, callOITotal, putOITotal } = data;
  
  // Calculate the angle for the gauge needle (0.5 is neutral, 0 is bearish, 1 is bullish)
  // Map the ratio from 0-2 range to 0-180 degrees
  const angle = Math.min(Math.max((2 - ratio) / 2, 0), 1) * 180;
  
  const isBullish = ratio < 1;
  
  return (
    <Card className="border-slate-700 bg-slate-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Put/Call Ratio</span>
          <div className="flex items-center text-sm">
            {ratio.toFixed(2)}
            <span className={`ml-2 flex items-center ${netChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
              {netChange < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
              {Math.abs(netChange).toFixed(2)}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-24 mb-2 overflow-hidden">
            {/* Gauge background */}
            <div className="absolute top-0 left-0 w-full h-full bg-transparent">
              <svg viewBox="0 0 200 100" className="w-full h-full">
                {/* Semicircle background */}
                <path 
                  d="M 10 90 A 90 90 0 0 1 190 90" 
                  stroke="#334155" 
                  strokeWidth="20" 
                  fill="none" 
                />
                
                {/* Bearish portion (red) */}
                <path 
                  d="M 10 90 A 90 90 0 0 1 100 90" 
                  stroke="#ef4444" 
                  strokeWidth="20" 
                  fill="none" 
                />
                
                {/* Bullish portion (teal) */}
                <path 
                  d="M 100 90 A 90 90 0 0 1 190 90" 
                  stroke="#0ea5e9" 
                  strokeWidth="20" 
                  fill="none" 
                />
                
                {/* Indicator line */}
                <line 
                  x1="100" 
                  y1="90" 
                  x2={100 - Math.cos(angle * Math.PI / 180) * 70} 
                  y2={90 - Math.sin(angle * Math.PI / 180) * 70} 
                  stroke="#f8fafc" 
                  strokeWidth="2.5" 
                />
                
                {/* Indicator circle */}
                <circle 
                  cx={100 - Math.cos(angle * Math.PI / 180) * 70} 
                  cy={90 - Math.sin(angle * Math.PI / 180) * 70} 
                  r="6" 
                  fill="#f8fafc" 
                />
                
                {/* Labels */}
                <text x="15" y="65" fill="#ef4444" fontSize="12" fontWeight="bold">Bearish</text>
                <text x="155" y="65" fill="#0ea5e9" fontSize="12" fontWeight="bold">Bullish</text>
              </svg>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 w-full mt-2 text-center">
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-400">Call OI</span>
              <span className="text-lg font-medium text-cyan-400">{callOITotal.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-400">Put OI</span>
              <span className="text-lg font-medium text-red-400">{putOITotal.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="w-full mt-6">
            <Tabs defaultValue="pcr" className="w-full">
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="pcr">PCR Trend</TabsTrigger>
                <TabsTrigger value="oi">OI Comparison</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pcr" className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      stroke="#94a3b8"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis domain={[0.7, 1.3]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <Tooltip 
                      formatter={(value: any) => [value.toFixed(2), 'PCR']}
                      labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                    />
                    <ReferenceLine y={1} stroke="#64748b" strokeDasharray="3 3" />
                    <Line 
                      type="monotone" 
                      dataKey="ratio" 
                      stroke="#a855f7" 
                      dot={false} 
                      activeDot={{ r: 4 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="oi" className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={historyData}
                    barGap={0}
                    barCategoryGap="20%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      stroke="#94a3b8"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <Tooltip 
                      formatter={(value: any) => [value.toLocaleString(), '']}
                      labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                    />
                    <Bar dataKey="callOITotal" name="Call OI" fill="#0ea5e9" />
                    <Bar dataKey="putOITotal" name="Put OI" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PutCallRatioGauge;
