
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketIndex } from '@/types/market';
import { formatNumber, formatPercent, getPriceChangeClass } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IndexCardProps {
  index: MarketIndex;
  onClick?: () => void;
  isSelected?: boolean;
}

const IndexCard: React.FC<IndexCardProps> = ({ index, onClick, isSelected = false }) => {
  const { name, value, change, changePercent } = index;
  const isPositive = change >= 0;
  const priceChangeClass = getPriceChangeClass(changePercent);
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:border-primary/70 hover:shadow-md",
        isSelected && "border-primary shadow-sm shadow-primary/20"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <span className="text-3xl font-semibold mb-1">
            {formatNumber(value)}
          </span>
          <div className="flex items-center">
            {isPositive ? (
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            )}
            <span className={priceChangeClass}>
              {formatNumber(change)} ({formatPercent(changePercent)})
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndexCard;
