
import { 
  OptionInterestData, 
  TimelineData, 
  PutCallRatioData 
} from '@/types/market';

// Generate mock timeline data for trading hours
export const getMockTimelineData = (): TimelineData[] => {
  const marketHours = [
    '9:15', '9:30', '9:45', '10:00', '10:15', '10:30', '10:45', '11:00', 
    '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00',
    '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30'
  ];
  
  // Base price at market open
  const basePrice = 23000;
  const timelineData: TimelineData[] = [];
  
  // Generate random data points for each market hour
  marketHours.forEach((time, index) => {
    // Price movement pattern throughout the day
    let priceMovement = Math.sin(index / 5) * 200;
    if (index > 15) {
      priceMovement += (Math.random() - 0.5) * 400; // More volatility in afternoon
    }
    
    const priceLevel = Math.round(basePrice + priceMovement);
    
    // Call and Put OI based on time of day
    // Morning: More call buying, Afternoon: More put buying
    const isMorning = index < 12;
    const baseOI = 500000 + (index * 50000);
    
    const callOI = Math.round(baseOI * (isMorning ? 1.2 : 0.8) * (1 + (Math.random() - 0.5) * 0.4));
    const putOI = Math.round(baseOI * (isMorning ? 0.8 : 1.2) * (1 + (Math.random() - 0.5) * 0.4));
    
    timelineData.push({
      time,
      callOI,
      putOI,
      priceLevel
    });
  });
  
  return timelineData;
};

// Generate mock option interest data for specific time
export const getMockOptionInterestData = (
  selectedTime: string, 
  basePrice: number = 23000
): OptionInterestData[] => {
  const result: OptionInterestData[] = [];
  
  // Create strike prices around the base price
  const strikes = [];
  for (let i = -10; i <= 10; i++) {
    strikes.push(Math.round((basePrice + i * 50) / 50) * 50);
  }
  
  // Current timestamp
  const now = new Date();
  
  strikes.forEach(strike => {
    // OI distribution based on distance from ATM
    const distanceFromATM = Math.abs(strike - basePrice);
    const atTheMoney = distanceFromATM < 100;
    
    // Call OI is higher for strikes below current price, Put OI higher for strikes above
    const isCallFavorable = strike <= basePrice;
    const isPutFavorable = strike >= basePrice;
    
    // Base OI values
    let callOI = 0;
    let putOI = 0;
    
    if (atTheMoney) {
      // At the money strikes have high OI on both sides
      callOI = Math.round(600000 * (1 + (Math.random() - 0.5) * 0.5));
      putOI = Math.round(550000 * (1 + (Math.random() - 0.5) * 0.5));
    } else {
      // OI decreases as we move away from ATM
      const distanceFactor = Math.max(0, 1 - (distanceFromATM / 500));
      callOI = Math.round(500000 * distanceFactor * (isCallFavorable ? 1.5 : 0.7) * (1 + (Math.random() - 0.5) * 0.4));
      putOI = Math.round(450000 * distanceFactor * (isPutFavorable ? 1.5 : 0.7) * (1 + (Math.random() - 0.5) * 0.4));
    }
    
    // OI changes
    const callOIChange = Math.round((Math.random() - 0.4) * 50000);
    const putOIChange = Math.round((Math.random() - 0.4) * 50000);
    
    result.push({
      timestamp: now.getTime(),
      strikePrice: strike,
      callOI,
      putOI,
      ceOiChange: callOIChange,
      peOiChange: putOIChange
    });
  });
  
  return result;
};

// Generate Put-Call Ratio data
export const getMockPutCallRatioData = (
  selectedTimeIndex: number,
  timelineData: TimelineData[]
): { current: PutCallRatioData, history: PutCallRatioData[] } => {
  const now = new Date();
  const history: PutCallRatioData[] = [];
  
  // Generate PCR historical data
  timelineData.forEach((data, index) => {
    const timestamp = new Date(now);
    
    // Adjust time based on the timeline data
    const [hours, minutes] = data.time.split(':').map(Number);
    timestamp.setHours(hours, minutes, 0, 0);
    
    const ratio = data.putOI / data.callOI;
    
    // Calculate net change from previous data point
    const prevRatio = index > 0 ? timelineData[index - 1].putOI / timelineData[index - 1].callOI : ratio;
    const netChange = ratio - prevRatio;
    
    history.push({
      timestamp: timestamp.getTime(),
      ratio,
      netChange,
      callOITotal: data.callOI,
      putOITotal: data.putOI
    });
  });
  
  // Current PCR data
  const current = history[selectedTimeIndex] || history[history.length - 1];
  
  return { current, history };
};
