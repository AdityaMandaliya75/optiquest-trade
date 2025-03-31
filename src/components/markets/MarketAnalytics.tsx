
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getMockTimelineData, 
  getMockOptionInterestData, 
  getMockPutCallRatioData 
} from '@/services/optionAnalyticsService';
import TradingTimeline from './TradingTimeline';
import PutCallRatioGauge from './PutCallRatioGauge';
import OptionInterestChart from './OptionInterestChart';
import { TimelineData, OptionInterestData, PutCallRatioData } from '@/types/market';
import IndexComparison from './IndexComparison';

interface MarketAnalyticsProps {
  symbol?: string;
  currentPrice?: number;
}

const MarketAnalytics: React.FC<MarketAnalyticsProps> = ({ 
  symbol = 'NIFTY', 
  currentPrice = 23500 
}) => {
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('12:00');
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number>(0);
  const [selectedInterval, setSelectedInterval] = useState<string>('1d');
  const [rangeMode, setRangeMode] = useState<boolean>(false);
  const [rangeData, setRangeData] = useState<{
    startTime: string;
    endTime: string;
    startIndex: number;
    endIndex: number;
  }>({
    startTime: '10:00',
    endTime: '14:00',
    startIndex: 0,
    endIndex: 0
  });
  const [optionInterestData, setOptionInterestData] = useState<OptionInterestData[]>([]);
  const [putCallRatioData, setPutCallRatioData] = useState<{
    current: PutCallRatioData;
    history: PutCallRatioData[];
  }>({ 
    current: {
      timestamp: Date.now(),
      ratio: 1,
      netChange: 0,
      callOITotal: 0,
      putOITotal: 0
    },
    history: []
  });
  
  useEffect(() => {
    // Load timeline data
    const timeline = getMockTimelineData();
    setTimelineData(timeline);
    
    // Set initial selected time to noon
    const noonIndex = timeline.findIndex(data => data.time === '12:00') || Math.floor(timeline.length / 2);
    setSelectedTimeIndex(noonIndex);
    setSelectedTime(timeline[noonIndex]?.time || '12:00');
    
    // Get option interest data for selected time
    const interestData = getMockOptionInterestData(timeline[noonIndex]?.time || '12:00', currentPrice);
    setOptionInterestData(interestData);
    
    // Get put-call ratio data
    const pcrData = getMockPutCallRatioData(noonIndex, timeline);
    setPutCallRatioData(pcrData);
    
    // Set initial range data
    setRangeData({
      startTime: timeline[Math.floor(timeline.length / 4)]?.time || '10:00',
      endTime: timeline[Math.floor(timeline.length * 3 / 4)]?.time || '14:00',
      startIndex: Math.floor(timeline.length / 4),
      endIndex: Math.floor(timeline.length * 3 / 4)
    });
  }, [currentPrice, selectedInterval]);
  
  const handleTimeSelected = (time: string, index: number) => {
    setSelectedTime(time);
    setSelectedTimeIndex(index);
    
    // Update option interest data for the selected time
    const interestData = getMockOptionInterestData(time, 
      timelineData[index]?.priceLevel || currentPrice);
    setOptionInterestData(interestData);
    
    // Update Put-Call ratio data
    const pcrData = getMockPutCallRatioData(index, timelineData);
    setPutCallRatioData(pcrData);
  };
  
  const handleRangeSelected = (startTime: string, endTime: string, startIndex: number, endIndex: number) => {
    setRangeData({ startTime, endTime, startIndex, endIndex });
    
    // Get data for the selected range
    const rangeAvgIndex = Math.floor((startIndex + endIndex) / 2);
    
    // Update option interest data for the range's average time
    const interestData = getMockOptionInterestData(
      timelineData[rangeAvgIndex]?.time || '12:00', 
      timelineData[rangeAvgIndex]?.priceLevel || currentPrice
    );
    setOptionInterestData(interestData);
    
    // Update Put-Call ratio data for the range
    const pcrData = getMockPutCallRatioData(rangeAvgIndex, timelineData);
    setPutCallRatioData(pcrData);
  };
  
  const handleIntervalChange = (interval: string) => {
    setSelectedInterval(interval);
    // In a real app, we would fetch new data for the selected interval
    // For now, we'll just simulate it by regenerating mock data
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            {symbol} <span className="text-sm ml-2 text-gray-400">Option Chain Analytics</span>
          </h2>
          <div className="flex items-center space-x-2">
            <div className="bg-slate-800 rounded-md p-1 flex items-center">
              <button 
                className={`px-2 py-1 text-xs rounded ${!rangeMode ? 'bg-primary text-white' : 'text-gray-400'}`}
                onClick={() => setRangeMode(false)}
              >
                Single
              </button>
              <button 
                className={`px-2 py-1 text-xs rounded ${rangeMode ? 'bg-primary text-white' : 'text-gray-400'}`}
                onClick={() => setRangeMode(true)}
              >
                Range
              </button>
            </div>
            <div className="px-3 py-1 bg-slate-800 rounded-full text-sm font-medium">
              LTP: <span className="text-primary">{currentPrice}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-4 flex items-center justify-end space-x-1">
          <span className="text-xs text-gray-400 mr-1">Interval:</span>
          {['1d', '5d', '1m', '3m', '1y'].map(interval => (
            <button
              key={interval}
              className={`px-2 py-1 text-xs rounded ${interval === selectedInterval ? 'bg-primary text-white' : 'bg-slate-800 text-gray-400'}`}
              onClick={() => handleIntervalChange(interval)}
            >
              {interval}
            </button>
          ))}
        </div>
        
        <TradingTimeline 
          data={timelineData} 
          onTimeSelected={handleTimeSelected}
          onRangeSelected={handleRangeSelected}
          rangeMode={rangeMode}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PutCallRatioGauge 
          data={putCallRatioData.current} 
          historyData={putCallRatioData.history} 
        />
        
        <OptionInterestChart 
          data={optionInterestData} 
          underlyingPrice={timelineData[selectedTimeIndex]?.priceLevel || currentPrice}
          timeLabel={rangeMode ? `${rangeData.startTime} - ${rangeData.endTime}` : selectedTime}
        />
      </div>
      
      <div className="mt-4">
        <IndexComparison interval={selectedInterval} />
      </div>
    </div>
  );
};

export default MarketAnalytics;
