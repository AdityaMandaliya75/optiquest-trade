import { Notification, WatchlistAlert, Stock, StockNews } from '@/types/market';
import { checkAlertsForTrigger } from './watchlistService';

// Store notifications
let notifications: Notification[] = [
  {
    id: '1',
    type: 'price_alert',
    title: 'Price Alert: RELIANCE',
    message: 'Reliance Industries has crossed above ₹2,600',
    timestamp: Date.now() - 3600000,
    relatedSymbol: 'RELIANCE',
    read: false,
    isImportant: true
  },
  {
    id: '2',
    type: 'news_alert',
    title: 'Important News: INFY',
    message: 'Infosys secures $1.5 billion deal',
    timestamp: Date.now() - 7200000,
    relatedSymbol: 'INFY',
    read: true,
    isImportant: true
  },
  {
    id: '3',
    type: 'system',
    title: 'Market Opening',
    message: 'Indian markets have opened for trading',
    timestamp: Date.now() - 21600000,
    read: true,
    isImportant: false
  }
];

// Get all notifications
export const getNotifications = (): Promise<Notification[]> => {
  return Promise.resolve([...notifications].sort((a, b) => b.timestamp - a.timestamp));
};

// Get unread count
export const getUnreadCount = (): Promise<number> => {
  const count = notifications.filter(n => !n.read).length;
  return Promise.resolve(count);
};

// Mark notification as read
export const markNotificationAsRead = (id: string): Promise<boolean> => {
  notifications = notifications.map(n => 
    n.id === id ? { ...n, read: true } : n
  );
  return Promise.resolve(true);
};

// Mark all notifications as read
export const markAllAsRead = (): Promise<boolean> => {
  notifications = notifications.map(n => ({ ...n, read: true }));
  return Promise.resolve(true);
};

// Delete a notification
export const deleteNotification = (id: string): Promise<boolean> => {
  notifications = notifications.filter(n => n.id !== id);
  return Promise.resolve(true);
};

// Create notification from alert
export const createNotificationFromAlert = (
  alert: WatchlistAlert, 
  stock: Stock
): Notification => {
  let title = '';
  let message = '';
  
  if (alert.type === 'price') {
    const condition = alert.condition === 'above' ? 'risen above' : 'fallen below';
    title = `Price Alert: ${stock.symbol}`;
    message = `${stock.name} has ${condition} ₹${alert.value}`;
  } else if (alert.type === 'change') {
    title = `Movement Alert: ${stock.symbol}`;
    message = `${stock.name} has moved by ${alert.value}% in a short time`;
  } else if (alert.type === 'volume') {
    title = `Volume Alert: ${stock.symbol}`;
    message = `${stock.name} is trading with unusually high volume`;
  }
  
  const notification: Notification = {
    id: Date.now().toString(),
    type: 'price_alert',
    title,
    message,
    timestamp: Date.now(),
    relatedSymbol: stock.symbol,
    read: false,
    isImportant: true
  };
  
  notifications = [...notifications, notification];
  return notification;
};

// Create notification from news
export const createNotificationFromNews = (news: StockNews): Notification => {
  const notification: Notification = {
    id: Date.now().toString(),
    type: 'news_alert',
    title: `News Alert: ${news.relatedSymbols.join(', ')}`,
    message: news.headline,
    timestamp: Date.now(),
    relatedSymbol: news.relatedSymbols[0],
    read: false,
    isImportant: news.isImportant || false
  };
  
  notifications = [...notifications, notification];
  return notification;
};

// Process stock updates and generate notifications
export const processStockUpdates = (stocks: Stock[]): Notification[] => {
  const triggeredAlerts = checkAlertsForTrigger(stocks);
  const newNotifications: Notification[] = [];
  
  triggeredAlerts.forEach(alertData => {
    const { alert, symbol } = alertData;
    const stock = stocks.find(s => s.symbol === symbol);
    if (stock) {
      const notification = createNotificationFromAlert(alert, stock);
      newNotifications.push(notification);
    }
  });
  
  return newNotifications;
};
