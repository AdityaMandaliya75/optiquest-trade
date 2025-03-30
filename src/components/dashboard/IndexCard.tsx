
import React from 'react';
import { MarketIndex } from '@/types/market';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber, formatPercent, getPriceChangeClass } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface IndexCardProps {
  index: MarketIndex;
}

const IndexCard: React.FC<IndexCardProps> = ({ index }) => {
  const { name, value, change, changePercent } = index;
  const changeClass = getPriceChangeClass(change);
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{name}</h3>
          {change > 0 ? (
            <TrendingUp className="h-4 w-4 text-profit" />
          ) : (
            <TrendingDown className="h-4 w-4 text-loss" />
          )}
        </div>
        
        <div className="mt-2">
          <p className="text-2xl font-bold">{formatNumber(value)}</p>
          <div className={`flex items-center mt-1 text-sm ${changeClass}`}>
            <span>{formatNumber(change)}</span>
            <span className="ml-1">({formatPercent(changePercent)})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndexCard;
