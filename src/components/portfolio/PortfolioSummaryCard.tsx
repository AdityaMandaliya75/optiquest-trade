
import React from 'react';
import { PortfolioSummary } from '@/types/market';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent, getPriceChangeClass } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioSummaryCardProps {
  summary: PortfolioSummary;
}

const PortfolioSummaryCard: React.FC<PortfolioSummaryCardProps> = ({ summary }) => {
  const { totalValue, totalInvestment, todayPnL, totalPnL, totalPnLPercent } = summary;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Portfolio Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Current Value</p>
              <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Investment</p>
              <p className="text-lg">{formatCurrency(totalInvestment)}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Today's P&L</p>
              <div className={`flex items-center ${getPriceChangeClass(todayPnL)}`}>
                <p className="text-lg">{formatCurrency(todayPnL)}</p>
                {todayPnL > 0 ? (
                  <TrendingUp className="ml-1 h-4 w-4" />
                ) : (
                  <TrendingDown className="ml-1 h-4 w-4" />
                )}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Overall P&L</p>
              <div className={`flex items-center ${getPriceChangeClass(totalPnL)}`}>
                <p className="text-lg">{formatCurrency(totalPnL)} ({formatPercent(totalPnLPercent)})</p>
                {totalPnL > 0 ? (
                  <TrendingUp className="ml-1 h-4 w-4" />
                ) : (
                  <TrendingDown className="ml-1 h-4 w-4" />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioSummaryCard;
