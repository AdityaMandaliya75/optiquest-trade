
import React, { useState } from 'react';
import { Stock, Option } from '@/types/market';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { formatCurrency, formatNumber, formatPercent, getPriceChangeClass } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TradePanelProps {
  stock?: Stock;
  option?: {
    option: Option;
    underlyingSymbol: string;
  };
  onPlaceOrder: (
    symbol: string,
    quantity: number,
    price: number,
    type: 'buy' | 'sell',
    instrumentType: 'stock' | 'option',
    optionDetails?: {
      strikePrice: number;
      expiryDate: string;
      type: 'call' | 'put';
    }
  ) => Promise<void>;
}

const TradePanel: React.FC<TradePanelProps> = ({ stock, option, onPlaceOrder }) => {
  const [quantity, setQuantity] = useState('1');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const { toast } = useToast();
  
  const instrumentType = stock ? 'stock' : 'option';
  const symbol = stock ? stock.symbol : option?.underlyingSymbol || '';
  const currentPrice = stock ? stock.price : option?.option.lastPrice || 0;
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers
    const value = e.target.value.replace(/\D/g, '');
    setQuantity(value);
  };
  
  const handleOrder = async () => {
    const parsedQuantity = parseInt(quantity);
    
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
        variant: "destructive"
      });
      return;
    }
    
    try {
      let optionDetails;
      
      if (option && option.option) {
        optionDetails = {
          strikePrice: option.option.strikePrice,
          expiryDate: option.option.expiryDate,
          type: option.option.type
        };
      }
      
      await onPlaceOrder(
        symbol,
        parsedQuantity,
        currentPrice,
        orderType,
        instrumentType,
        optionDetails
      );
      
      toast({
        title: "Order Placed",
        description: `Successfully ${orderType === 'buy' ? 'bought' : 'sold'} ${parsedQuantity} ${symbol} ${optionDetails ? optionDetails.type : ''} at ${formatNumber(currentPrice)}`,
      });
      
      // Reset quantity after order
      setQuantity('1');
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "There was an error placing your order",
        variant: "destructive"
      });
    }
  };
  
  const totalValue = parseInt(quantity) * currentPrice || 0;
  
  const renderInstrumentDetails = () => {
    if (stock) {
      return (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">{formatNumber(stock.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Change:</span>
            <span className={getPriceChangeClass(stock.change)}>
              {formatNumber(stock.change)} ({formatPercent(stock.changePercent)})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">High:</span>
            <span>{formatNumber(stock.high)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Low:</span>
            <span>{formatNumber(stock.low)}</span>
          </div>
        </div>
      );
    } else if (option && option.option) {
      const { strikePrice, type, lastPrice, change, changePercent, impliedVolatility } = option.option;
      
      return (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Option:</span>
            <div className="text-right">
              <span className="font-medium">{option.underlyingSymbol} {formatNumber(strikePrice)} {type.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">{formatNumber(lastPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Change:</span>
            <span className={getPriceChangeClass(change)}>
              {formatNumber(change)} ({formatPercent(changePercent)})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">IV:</span>
            <span>{formatPercent(impliedVolatility)}</span>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Place Order</CardTitle>
      </CardHeader>
      <CardContent>
        {renderInstrumentDetails()}
        
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Order Type</label>
            <Select 
              value={orderType} 
              onValueChange={(value) => setOrderType(value as 'buy' | 'sell')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Quantity</label>
            <Input 
              type="text"
              value={quantity} 
              onChange={handleQuantityChange} 
              placeholder="Enter quantity" 
            />
          </div>
          
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Total Value:</span>
              <span className="font-medium">{formatCurrency(totalValue)}</span>
            </div>
            
            <Button 
              onClick={handleOrder} 
              className="w-full" 
              variant={orderType === 'buy' ? 'default' : 'destructive'}
            >
              {orderType === 'buy' ? 'Buy' : 'Sell'} {instrumentType.charAt(0).toUpperCase() + instrumentType.slice(1)}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradePanel;
