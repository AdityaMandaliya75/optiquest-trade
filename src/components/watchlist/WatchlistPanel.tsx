
import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Eye, 
  EyeOff, 
  Plus, 
  Bell, 
  BellOff, 
  MoreVertical, 
  X, 
  Edit, 
  Trash, 
  ChevronDown,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { Stock } from '@/types/market';
import { useWatchlist } from '@/context/WatchlistContext';
import { formatNumber, formatPercent, getPriceChangeClass } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface WatchlistPanelProps {
  stocks: Stock[];
}

const WatchlistPanel: React.FC<WatchlistPanelProps> = ({ stocks }) => {
  const { 
    watchlists,
    activeWatchlist,
    setActiveWatchlist,
    createNewWatchlist,
    renameWatchlist,
    removeWatchlist,
    addStock,
    removeStock,
    createAlert,
    deleteAlert,
    loading
  } = useWatchlist();
  
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [editWatchlistName, setEditWatchlistName] = useState('');
  const [editWatchlistId, setEditWatchlistId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [alertValue, setAlertValue] = useState<string>('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const navigate = useNavigate();
  
  const handleCreateWatchlist = () => {
    if (newWatchlistName.trim()) {
      createNewWatchlist(newWatchlistName);
      setNewWatchlistName('');
      setShowCreateDialog(false);
    }
  };
  
  const handleRenameWatchlist = () => {
    if (editWatchlistId && editWatchlistName.trim()) {
      renameWatchlist(editWatchlistId, editWatchlistName);
      setEditWatchlistName('');
      setEditWatchlistId(null);
      setShowEditDialog(false);
    }
  };
  
  const handleEditWatchlist = (id: string, name: string) => {
    setEditWatchlistId(id);
    setEditWatchlistName(name);
    setShowEditDialog(true);
  };
  
  const handleAddAlert = () => {
    if (activeWatchlist && selectedStock && alertValue) {
      createAlert(
        activeWatchlist.id,
        selectedStock,
        {
          type: 'price',
          condition: alertCondition,
          value: parseFloat(alertValue)
        }
      );
      setAlertValue('');
      setShowAlertDialog(false);
    }
  };
  
  const handleOpenAlertDialog = (symbol: string) => {
    setSelectedStock(symbol);
    setShowAlertDialog(true);
  };
  
  const getStockData = (symbol: string) => {
    return stocks.find(stock => stock.symbol === symbol);
  };
  
  const handleStockClick = (symbol: string) => {
    navigate(`/markets/stocks/${symbol}`);
  };
  
  const renderWatchlistItems = () => {
    if (!activeWatchlist) return null;
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Change</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeWatchlist.stocks.map(item => {
            const stockData = getStockData(item.symbol);
            
            if (!stockData) return null;
            
            return (
              <TableRow key={item.symbol} className="cursor-pointer">
                <TableCell 
                  className="font-medium"
                  onClick={() => handleStockClick(item.symbol)}
                >
                  {item.symbol}
                </TableCell>
                <TableCell onClick={() => handleStockClick(item.symbol)}>
                  {stockData.name}
                </TableCell>
                <TableCell 
                  className="text-right"
                  onClick={() => handleStockClick(item.symbol)}
                >
                  {formatNumber(stockData.price)}
                </TableCell>
                <TableCell 
                  className={`text-right ${getPriceChangeClass(stockData.change)}`}
                  onClick={() => handleStockClick(item.symbol)}
                >
                  {formatNumber(stockData.change)} ({formatPercent(stockData.changePercent)})
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenAlertDialog(item.symbol)}
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removeStock(activeWatchlist.id, item.symbol)}
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };
  
  const renderActiveAlerts = () => {
    if (!activeWatchlist) return null;
    
    const allAlerts = activeWatchlist.stocks.flatMap(stock => 
      (stock.alerts || []).map(alert => ({ stock, alert }))
    );
    
    if (allAlerts.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No active alerts</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {allAlerts.map(({ stock, alert }) => (
          <Alert key={alert.id} className="flex items-center justify-between">
            <div>
              <AlertTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                {stock.symbol} {alert.condition === 'above' ? 'Above' : 'Below'} ₹{alert.value}
              </AlertTitle>
              <AlertDescription>
                Alert when price {alert.condition === 'above' ? 'rises above' : 'falls below'} ₹{alert.value}
              </AlertDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => deleteAlert(activeWatchlist.id, stock.symbol, alert.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        ))}
      </div>
    );
  };
  
  if (loading) {
    return <div className="text-center p-8">Loading watchlists...</div>;
  }
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle>Watchlists</CardTitle>
            {activeWatchlist && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {watchlists.map((watchlist) => (
                    <DropdownMenuItem 
                      key={watchlist.id}
                      onClick={() => setActiveWatchlist(watchlist)}
                      className={activeWatchlist.id === watchlist.id ? "bg-secondary" : ""}
                    >
                      {watchlist.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Watchlist
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {activeWatchlist && (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditWatchlist(activeWatchlist.id, activeWatchlist.name)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => removeWatchlist(activeWatchlist.id)}
                    className="text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto pb-0">
        {!activeWatchlist ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <p className="text-center text-muted-foreground">No watchlists yet</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Watchlist
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="watchlist">
            <TabsList className="mb-4">
              <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="watchlist" className="h-[calc(100%-40px)]">
              <div className="h-full overflow-auto">
                {activeWatchlist.stocks.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground mb-4">Add stocks to your watchlist</p>
                    {stocks.length > 0 && (
                      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                        {stocks.slice(0, 10).map(stock => (
                          <div 
                            key={stock.symbol}
                            className="flex justify-between items-center p-2 border rounded-md"
                          >
                            <span className="font-medium">{stock.symbol} - {stock.name}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => addStock(activeWatchlist.id, { symbol: stock.symbol, name: stock.name })}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  renderWatchlistItems()
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="alerts" className="h-[calc(100%-40px)] overflow-auto">
              {renderActiveAlerts()}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      {activeWatchlist && activeWatchlist.stocks.length > 0 && (
        <CardFooter className="pt-4 pb-4 flex justify-between border-t mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {activeWatchlist.stocks.length} {activeWatchlist.stocks.length === 1 ? 'stock' : 'stocks'}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (stocks.length > 0) {
                  addStock(activeWatchlist.id, { 
                    symbol: stocks[0].symbol, 
                    name: stocks[0].name 
                  });
                }
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Stock
            </Button>
          </div>
        </CardFooter>
      )}
      
      {/* Create Watchlist Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Watchlist</DialogTitle>
            <DialogDescription>
              Enter a name for your new watchlist.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Watchlist Name"
              value={newWatchlistName}
              onChange={(e) => setNewWatchlistName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWatchlist}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Watchlist Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Watchlist</DialogTitle>
            <DialogDescription>
              Enter a new name for your watchlist.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Watchlist Name"
              value={editWatchlistName}
              onChange={(e) => setEditWatchlistName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameWatchlist}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Alert Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Price Alert</DialogTitle>
            <DialogDescription>
              Set a price alert for {selectedStock}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex gap-2">
              <Button
                variant={alertCondition === 'above' ? 'default' : 'outline'}
                onClick={() => setAlertCondition('above')}
                className="flex-1"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Above
              </Button>
              <Button
                variant={alertCondition === 'below' ? 'default' : 'outline'}
                onClick={() => setAlertCondition('below')}
                className="flex-1"
              >
                <TrendingDown className="mr-2 h-4 w-4" />
                Below
              </Button>
            </div>
            <Input
              type="number"
              placeholder="Price (₹)"
              value={alertValue}
              onChange={(e) => setAlertValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlertDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAlert}>
              Create Alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WatchlistPanel;
