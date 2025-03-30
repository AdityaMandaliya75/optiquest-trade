
import React from 'react';
import { PortfolioHolding } from '@/types/market';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber, formatPercent, getPriceChangeClass } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface PortfolioHoldingsTableProps {
  holdings: PortfolioHolding[];
}

const PortfolioHoldingsTable: React.FC<PortfolioHoldingsTableProps> = ({ holdings }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="stock-table">
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Avg Price</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right">P&L %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.length > 0 ? (
                holdings.map((holding) => (
                  <TableRow key={
                    `${holding.symbol}-${holding.instrumentType}-${
                      holding.optionDetails 
                        ? `${holding.optionDetails.strikePrice}-${holding.optionDetails.type}` 
                        : ''
                    }`
                  }>
                    <TableCell className="font-medium">
                      {holding.symbol}
                      {holding.optionDetails && (
                        <div className="text-xs text-muted-foreground">
                          {holding.optionDetails.strikePrice} {holding.optionDetails.type.toUpperCase()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={holding.instrumentType === 'stock' ? 'default' : 'outline'}>
                        {holding.instrumentType === 'stock' ? 'Stock' : 'Option'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{holding.quantity}</TableCell>
                    <TableCell className="text-right">{formatNumber(holding.avgPrice)}</TableCell>
                    <TableCell className="text-right">{formatNumber(holding.currentPrice)}</TableCell>
                    <TableCell className={`text-right ${getPriceChangeClass(holding.pnl)}`}>
                      {formatCurrency(holding.pnl)}
                    </TableCell>
                    <TableCell className={`text-right ${getPriceChangeClass(holding.pnlPercent)}`}>
                      {formatPercent(holding.pnlPercent)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No holdings found. Start trading to build your portfolio.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioHoldingsTable;
