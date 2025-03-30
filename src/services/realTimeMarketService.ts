
import { Stock, MarketIndex, Notification } from '@/types/market';
import { getStocks, getIndices } from './marketService';
import { processStockUpdates } from './notificationService';

// Callback types
type StocksCallback = (stocks: Stock[]) => void;
type IndicesCallback = (indices: MarketIndex[]) => void;
type NotificationCallback = (notifications: Notification[]) => void;

// Simulate real-time updates with intervals
let stocksInterval: number | null = null;
let indicesInterval: number | null = null;
let notificationCallbacks: NotificationCallback[] = [];

// Start real-time updates
export const startRealTimeUpdates = (
  onStocksUpdate: StocksCallback,
  onIndicesUpdate: IndicesCallback,
  onNotificationsReceived?: NotificationCallback
): () => void => {
  let stocks: Stock[] = [];
  let indices: MarketIndex[] = [];
  
  // Add notification callback if provided
  if (onNotificationsReceived) {
    notificationCallbacks.push(onNotificationsReceived);
  }
  
  // Initialize data
  const initialize = async () => {
    stocks = await getStocks();
    indices = await getIndices();
    
    // Send initial data
    onStocksUpdate([...stocks]);
    onIndicesUpdate([...indices]);
  };
  
  initialize();
  
  // Update stocks every 5 seconds
  stocksInterval = window.setInterval(() => {
    // Simulate price changes
    stocks = stocks.map(stock => {
      const changePercent = (Math.random() * 2 - 1) * 0.5; // Random change between -0.5% and 0.5%
      const priceChange = stock.price * (changePercent / 100);
      const newPrice = stock.price + priceChange;
      
      return {
        ...stock,
        price: parseFloat(newPrice.toFixed(2)),
        change: parseFloat((stock.change + priceChange).toFixed(2)),
        changePercent: parseFloat((stock.changePercent + changePercent).toFixed(2)),
        high: newPrice > stock.high ? newPrice : stock.high,
        low: newPrice < stock.low ? newPrice : stock.low,
        volume: stock.volume + Math.floor(Math.random() * 100000)
      };
    });
    
    // Send updated stocks
    onStocksUpdate([...stocks]);
    
    // Process for notifications
    const newNotifications = processStockUpdates(stocks);
    if (newNotifications.length > 0) {
      notificationCallbacks.forEach(callback => {
        callback(newNotifications);
      });
    }
  }, 5000);
  
  // Update indices every 10 seconds
  indicesInterval = window.setInterval(() => {
    // Simulate index changes
    indices = indices.map(index => {
      const changePercent = (Math.random() * 2 - 1) * 0.3; // Random change between -0.3% and 0.3%
      const valueChange = index.value * (changePercent / 100);
      const newValue = index.value + valueChange;
      
      return {
        ...index,
        value: parseFloat(newValue.toFixed(2)),
        change: parseFloat((index.change + valueChange).toFixed(2)),
        changePercent: parseFloat((index.changePercent + changePercent).toFixed(2)),
        high: newValue > index.high ? newValue : index.high,
        low: newValue < index.low ? newValue : index.low
      };
    });
    
    // Send updated indices
    onIndicesUpdate([...indices]);
  }, 10000);
  
  // Return cleanup function
  return () => {
    if (stocksInterval) window.clearInterval(stocksInterval);
    if (indicesInterval) window.clearInterval(indicesInterval);
    if (onNotificationsReceived) {
      notificationCallbacks = notificationCallbacks.filter(cb => cb !== onNotificationsReceived);
    }
  };
};

// Register for notifications only
export const subscribeToNotifications = (callback: NotificationCallback): () => void => {
  notificationCallbacks.push(callback);
  
  return () => {
    notificationCallbacks = notificationCallbacks.filter(cb => cb !== callback);
  };
};
