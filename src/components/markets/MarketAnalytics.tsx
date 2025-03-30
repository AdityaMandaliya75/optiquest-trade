
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  getMockTimelineData, 
  getMockOptionInterestData, 
  getMockPutCallRatioData 
} from '@/services/optionAnalyticsService';
import TradingTimeline from './TradingTimeline';
import PutCallRatioGauge from './PutCallRatioGauge';
import OptionInterestChart from './OptionInterestChart';
import { TimelineData, OptionInterestData, PutCallRatioData } from '@/types/market';

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
  }, [currentPrice]);
  
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
  
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            {symbol} <span className="text-sm ml-2 text-gray-400">Option Chain Analytics</span>
          </h2>
          <div className="px-3 py-1 bg-slate-800 rounded-full text-sm font-medium">
            LTP: <span className="text-primary">{currentPrice}</span>
          </div>
        </div>
        
        <TradingTimeline 
          data={timelineData} 
          onTimeSelected={handleTimeSelected}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PutCallRatioGauge 
          data={putCallRatioData.current} 
          historyData={putCallRatioData.history} 
        />
        
        <OptionInterestChart 
          data={optionInterestData} 
          underlyingPrice={timelineData[selectedTimeIndex]?.priceLevel || currentPrice}
          timeLabel={selectedTime}
        />
      </div>
    </div>
  );
};

export default MarketAnalytics;
