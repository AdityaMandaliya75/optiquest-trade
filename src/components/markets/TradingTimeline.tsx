
import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { TimelineData } from '@/types/market';
import { cn } from '@/lib/utils';

interface TradingTimelineProps {
  data: TimelineData[];
  onTimeSelected: (time: string, index: number) => void;
}

const TradingTimeline: React.FC<TradingTimelineProps> = ({ data, onTimeSelected }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(Math.floor(data.length / 2));
  const [isHovering, setIsHovering] = useState(false);
  
  const handleTimelineChange = (values: number[]) => {
    const index = Math.round(values[0]);
    setSelectedIndex(index);
    onTimeSelected(data[index]?.time || '12:00', index);
  };
  
  useEffect(() => {
    if (data.length > 0) {
      onTimeSelected(data[selectedIndex]?.time || '12:00', selectedIndex);
    }
  }, [data]);
  
  const marketHours = [
    '9:15', '9:30', '9:45', '10:00', '10:15', '10:30', '10:45', '11:00', 
    '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00',
    '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30'
  ];
  
  return (
    <div className="space-y-4 w-full bg-slate-900 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-200">Trading Timeline</h3>
        <div className="text-xs text-gray-400">
          Selected: <span className="text-primary font-semibold">{data[selectedIndex]?.time || "12:00"}</span>
        </div>
      </div>
      
      <div 
        className="pt-1 pb-8 relative" 
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Slider
          value={[selectedIndex]} 
          min={0} 
          max={data.length - 1} 
          step={1}
          onValueChange={handleTimelineChange}
          className="mb-1"
        />
        
        <div className="flex justify-between text-[10px] text-gray-400 absolute w-full">
          {marketHours.filter((_, i) => i % 3 === 0).map((time, index) => (
            <div 
              key={time} 
              className="absolute transform -translate-x-1/2 text-center"
              style={{ left: `${(index * 3) / (marketHours.length - 1) * 100}%` }}
            >
              <div className="h-1.5 border-l border-gray-600 mb-1 mx-auto"></div>
              {time}
            </div>
          ))}
        </div>
        
        {isHovering && data[selectedIndex] && (
          <div className="absolute left-1/2 transform -translate-x-1/2 bg-slate-800 border border-slate-600 rounded px-3 py-1.5 shadow-lg text-xs whitespace-nowrap text-gray-200">
            <div className="font-semibold">{data[selectedIndex].time}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div>Call OI: <span className="text-cyan-400">{data[selectedIndex].callOI.toLocaleString()}</span></div>
              <div>Put OI: <span className="text-red-400">{data[selectedIndex].putOI.toLocaleString()}</span></div>
              <div className="col-span-2">Price: {data[selectedIndex].priceLevel}</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>Market Open (9:15)</span>
        <span>Market Close (15:30)</span>
      </div>
    </div>
  );
};

export default TradingTimeline;
