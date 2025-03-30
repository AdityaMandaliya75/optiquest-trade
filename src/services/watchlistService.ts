
import { Watchlist, WatchlistItem, WatchlistAlert, Stock } from '@/types/market';

// Mock watchlists data
let watchlists: Watchlist[] = [
  {
    id: '1',
    name: 'Default Watchlist',
    stocks: [
      { 
        symbol: 'RELIANCE', 
        name: 'Reliance Industries Ltd.',
        addedAt: Date.now() - 86400000,
        alerts: [
          {
            id: '1',
            type: 'price',
            condition: 'above',
            value: 2650,
            triggered: false,
            createdAt: Date.now() - 86400000,
          }
        ]
      },
      { 
        symbol: 'INFY', 
        name: 'Infosys Ltd.',
        addedAt: Date.now() - 86400000 * 2,
      },
      { 
        symbol: 'HDFCBANK', 
        name: 'HDFC Bank Ltd.',
        addedAt: Date.now() - 86400000 * 3,
      }
    ]
  },
  {
    id: '2',
    name: 'IT Stocks',
    stocks: [
      { 
        symbol: 'INFY', 
        name: 'Infosys Ltd.',
        addedAt: Date.now() - 86400000 * 2,
      },
      { 
        symbol: 'TCS', 
        name: 'Tata Consultancy Services Ltd.',
        addedAt: Date.now() - 86400000 * 4,
      },
      { 
        symbol: 'WIPRO', 
        name: 'Wipro Ltd.',
        addedAt: Date.now() - 86400000 * 5,
      }
    ]
  }
];

// Get all watchlists
export const getWatchlists = (): Promise<Watchlist[]> => {
  return Promise.resolve(watchlists);
};

// Get a specific watchlist by ID
export const getWatchlistById = (id: string): Promise<Watchlist | undefined> => {
  const watchlist = watchlists.find(wl => wl.id === id);
  return Promise.resolve(watchlist);
};

// Create a new watchlist
export const createWatchlist = (name: string): Promise<Watchlist> => {
  const newWatchlist: Watchlist = {
    id: Date.now().toString(),
    name,
    stocks: []
  };
  
  watchlists = [...watchlists, newWatchlist];
  return Promise.resolve(newWatchlist);
};

// Update a watchlist
export const updateWatchlist = (id: string, name: string): Promise<Watchlist | undefined> => {
  watchlists = watchlists.map(wl => 
    wl.id === id ? { ...wl, name } : wl
  );
  
  return getWatchlistById(id);
};

// Delete a watchlist
export const deleteWatchlist = (id: string): Promise<boolean> => {
  watchlists = watchlists.filter(wl => wl.id !== id);
  return Promise.resolve(true);
};

// Add a stock to a watchlist
export const addStockToWatchlist = (
  watchlistId: string, 
  stock: { symbol: string; name: string }
): Promise<Watchlist | undefined> => {
  watchlists = watchlists.map(wl => {
    if (wl.id === watchlistId) {
      // Check if stock already exists in the watchlist
      const exists = wl.stocks.some(s => s.symbol === stock.symbol);
      if (!exists) {
        return {
          ...wl,
          stocks: [...wl.stocks, { ...stock, addedAt: Date.now() }]
        };
      }
    }
    return wl;
  });
  
  return getWatchlistById(watchlistId);
};

// Remove a stock from a watchlist
export const removeStockFromWatchlist = (
  watchlistId: string,
  symbol: string
): Promise<Watchlist | undefined> => {
  watchlists = watchlists.map(wl => {
    if (wl.id === watchlistId) {
      return {
        ...wl,
        stocks: wl.stocks.filter(s => s.symbol !== symbol)
      };
    }
    return wl;
  });
  
  return getWatchlistById(watchlistId);
};

// Add an alert to a stock in a watchlist
export const addAlertToStock = (
  watchlistId: string,
  symbol: string,
  alert: Omit<WatchlistAlert, 'id' | 'createdAt' | 'triggered'>
): Promise<WatchlistAlert | undefined> => {
  const newAlert: WatchlistAlert = {
    id: Date.now().toString(),
    ...alert,
    triggered: false,
    createdAt: Date.now()
  };
  
  watchlists = watchlists.map(wl => {
    if (wl.id === watchlistId) {
      return {
        ...wl,
        stocks: wl.stocks.map(stock => {
          if (stock.symbol === symbol) {
            return {
              ...stock,
              alerts: [...(stock.alerts || []), newAlert]
            };
          }
          return stock;
        })
      };
    }
    return wl;
  });
  
  return Promise.resolve(newAlert);
};

// Remove an alert from a stock
export const removeAlert = (
  watchlistId: string,
  symbol: string,
  alertId: string
): Promise<boolean> => {
  watchlists = watchlists.map(wl => {
    if (wl.id === watchlistId) {
      return {
        ...wl,
        stocks: wl.stocks.map(stock => {
          if (stock.symbol === symbol && stock.alerts) {
            return {
              ...stock,
              alerts: stock.alerts.filter(alert => alert.id !== alertId)
            };
          }
          return stock;
        })
      };
    }
    return wl;
  });
  
  return Promise.resolve(true);
};

// Check if any alerts need to be triggered based on current stock data
export const checkAlertsForTrigger = (stocks: Stock[]): WatchlistAlert[] => {
  const triggeredAlerts: WatchlistAlert[] = [];
  
  watchlists.forEach(watchlist => {
    watchlist.stocks.forEach(watchlistStock => {
      const stock = stocks.find(s => s.symbol === watchlistStock.symbol);
      if (stock && watchlistStock.alerts) {
        watchlistStock.alerts.forEach(alert => {
          if (!alert.triggered) {
            let shouldTrigger = false;
            
            if (alert.type === 'price' && alert.condition === 'above' && stock.price > Number(alert.value)) {
              shouldTrigger = true;
            } else if (alert.type === 'price' && alert.condition === 'below' && stock.price < Number(alert.value)) {
              shouldTrigger = true;
            } else if (alert.type === 'change' && alert.condition === 'percent_change' && 
                      Math.abs(stock.changePercent) > Number(alert.value)) {
              shouldTrigger = true;
            } else if (alert.type === 'volume' && stock.volume > Number(alert.value)) {
              shouldTrigger = true;
            }
            
            if (shouldTrigger) {
              // Mark the alert as triggered
              alert.triggered = true;
              triggeredAlerts.push(alert);
            }
          }
        });
      }
    });
  });
  
  return triggeredAlerts;
};
