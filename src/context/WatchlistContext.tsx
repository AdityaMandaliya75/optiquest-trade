
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Watchlist, Stock, WatchlistAlert } from '@/types/market';
import { 
  getWatchlists,
  createWatchlist,
  updateWatchlist,
  deleteWatchlist,
  addStockToWatchlist,
  removeStockFromWatchlist,
  addAlertToStock,
  removeAlert
} from '@/services/watchlistService';
import { useToast } from '@/hooks/use-toast';

interface WatchlistContextType {
  watchlists: Watchlist[];
  activeWatchlist: Watchlist | null;
  setActiveWatchlist: (watchlist: Watchlist) => void;
  createNewWatchlist: (name: string) => Promise<void>;
  renameWatchlist: (id: string, name: string) => Promise<void>;
  removeWatchlist: (id: string) => Promise<void>;
  addStock: (watchlistId: string, stock: Pick<Stock, 'symbol' | 'name'>) => Promise<void>;
  removeStock: (watchlistId: string, symbol: string) => Promise<void>;
  createAlert: (watchlistId: string, symbol: string, alert: Omit<WatchlistAlert, 'id' | 'createdAt' | 'triggered'>) => Promise<void>;
  deleteAlert: (watchlistId: string, symbol: string, alertId: string) => Promise<void>;
  loading: boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [activeWatchlist, setActiveWatchlist] = useState<Watchlist | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWatchlists = async () => {
      try {
        const data = await getWatchlists();
        setWatchlists(data);
        if (data.length > 0 && !activeWatchlist) {
          setActiveWatchlist(data[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching watchlists:', error);
        setLoading(false);
      }
    };

    fetchWatchlists();
  }, []);

  const handleCreateWatchlist = async (name: string) => {
    try {
      const newWatchlist = await createWatchlist(name);
      setWatchlists(prev => [...prev, newWatchlist]);
      setActiveWatchlist(newWatchlist);
      toast({
        title: "Watchlist Created",
        description: `${name} watchlist has been created.`
      });
    } catch (error) {
      console.error('Error creating watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to create watchlist",
        variant: "destructive"
      });
    }
  };

  const handleRenameWatchlist = async (id: string, name: string) => {
    try {
      const updated = await updateWatchlist(id, name);
      if (updated) {
        setWatchlists(prev => prev.map(wl => (wl.id === id ? updated : wl)));
        if (activeWatchlist?.id === id) {
          setActiveWatchlist(updated);
        }
        toast({
          title: "Watchlist Updated",
          description: `Watchlist renamed to ${name}.`
        });
      }
    } catch (error) {
      console.error('Error renaming watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to rename watchlist",
        variant: "destructive"
      });
    }
  };

  const handleRemoveWatchlist = async (id: string) => {
    try {
      await deleteWatchlist(id);
      const updatedWatchlists = watchlists.filter(wl => wl.id !== id);
      setWatchlists(updatedWatchlists);
      if (activeWatchlist?.id === id) {
        setActiveWatchlist(updatedWatchlists.length > 0 ? updatedWatchlists[0] : null);
      }
      toast({
        title: "Watchlist Removed",
        description: "The watchlist has been removed."
      });
    } catch (error) {
      console.error('Error removing watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove watchlist",
        variant: "destructive"
      });
    }
  };

  const handleAddStock = async (watchlistId: string, stock: Pick<Stock, 'symbol' | 'name'>) => {
    try {
      const updated = await addStockToWatchlist(watchlistId, stock);
      if (updated) {
        setWatchlists(prev => prev.map(wl => (wl.id === watchlistId ? updated : wl)));
        if (activeWatchlist?.id === watchlistId) {
          setActiveWatchlist(updated);
        }
        toast({
          title: "Stock Added",
          description: `${stock.symbol} added to watchlist.`
        });
      }
    } catch (error) {
      console.error('Error adding stock to watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to add stock to watchlist",
        variant: "destructive"
      });
    }
  };

  const handleRemoveStock = async (watchlistId: string, symbol: string) => {
    try {
      const updated = await removeStockFromWatchlist(watchlistId, symbol);
      if (updated) {
        setWatchlists(prev => prev.map(wl => (wl.id === watchlistId ? updated : wl)));
        if (activeWatchlist?.id === watchlistId) {
          setActiveWatchlist(updated);
        }
        toast({
          title: "Stock Removed",
          description: `${symbol} removed from watchlist.`
        });
      }
    } catch (error) {
      console.error('Error removing stock from watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove stock from watchlist",
        variant: "destructive"
      });
    }
  };

  const handleCreateAlert = async (
    watchlistId: string,
    symbol: string,
    alert: Omit<WatchlistAlert, 'id' | 'createdAt' | 'triggered'>
  ) => {
    try {
      const newAlert = await addAlertToStock(watchlistId, symbol, alert);
      if (newAlert) {
        // Update watchlists state
        setWatchlists(prev => 
          prev.map(wl => {
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
          })
        );
        
        // Update active watchlist if needed
        if (activeWatchlist?.id === watchlistId) {
          setActiveWatchlist(prev => {
            if (!prev) return null;
            return {
              ...prev,
              stocks: prev.stocks.map(stock => {
                if (stock.symbol === symbol) {
                  return {
                    ...stock,
                    alerts: [...(stock.alerts || []), newAlert]
                  };
                }
                return stock;
              })
            };
          });
        }
        
        toast({
          title: "Alert Created",
          description: `Price alert for ${symbol} has been created.`
        });
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Error",
        description: "Failed to create alert",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAlert = async (watchlistId: string, symbol: string, alertId: string) => {
    try {
      await removeAlert(watchlistId, symbol, alertId);
      
      // Update watchlists state
      setWatchlists(prev => 
        prev.map(wl => {
          if (wl.id === watchlistId) {
            return {
              ...wl,
              stocks: wl.stocks.map(stock => {
                if (stock.symbol === symbol && stock.alerts) {
                  return {
                    ...stock,
                    alerts: stock.alerts.filter(a => a.id !== alertId)
                  };
                }
                return stock;
              })
            };
          }
          return wl;
        })
      );
      
      // Update active watchlist if needed
      if (activeWatchlist?.id === watchlistId) {
        setActiveWatchlist(prev => {
          if (!prev) return null;
          return {
            ...prev,
            stocks: prev.stocks.map(stock => {
              if (stock.symbol === symbol && stock.alerts) {
                return {
                  ...stock,
                  alerts: stock.alerts.filter(a => a.id !== alertId)
                };
              }
              return stock;
            })
          };
        });
      }
      
      toast({
        title: "Alert Removed",
        description: `Alert for ${symbol} has been removed.`
      });
    } catch (error) {
      console.error('Error removing alert:', error);
      toast({
        title: "Error",
        description: "Failed to remove alert",
        variant: "destructive"
      });
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlists,
        activeWatchlist,
        setActiveWatchlist,
        createNewWatchlist: handleCreateWatchlist,
        renameWatchlist: handleRenameWatchlist,
        removeWatchlist: handleRemoveWatchlist,
        addStock: handleAddStock,
        removeStock: handleRemoveStock,
        createAlert: handleCreateAlert,
        deleteAlert: handleDeleteAlert,
        loading
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = (): WatchlistContextType => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
