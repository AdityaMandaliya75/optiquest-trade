
import React, { useState } from 'react';
import { Stock } from '@/types/market';
import { formatNumber, formatPercent, getPriceChangeClass, abbreviateNumber } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StockTableProps {
  stocks: Stock[];
}

type SortKey = 'symbol' | 'price' | 'change' | 'changePercent' | 'volume';
type SortDirection = 'asc' | 'desc';

const StockTable: React.FC<StockTableProps> = ({ stocks }) => {
  const [sortKey, setSortKey] = useState<SortKey>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();
  
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  const sortedStocks = [...stocks]
    .filter(stock => 
      stock.symbol.toLowerCase().includes(filter.toLowerCase()) || 
      stock.name.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      let compareA = a[sortKey];
      let compareB = b[sortKey];
      
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof compareA === 'string' && typeof compareB === 'string') {
        return compareA.localeCompare(compareB) * direction;
      } else {
        return ((compareA as number) - (compareB as number)) * direction;
      }
    });
  
  const handleRowClick = (symbol: string) => {
    navigate(`/markets/stocks/${symbol}`);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Top Stocks</CardTitle>
          <div className="relative w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search stocks..."
              className="pl-8"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          <Table className="stock-table">
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer w-[140px]"
                  onClick={() => handleSort('symbol')}
                >
                  Symbol
                  {sortKey === 'symbol' && (
                    sortDirection === 'asc' ? <ArrowUp className="ml-1 inline h-3 w-3" /> : <ArrowDown className="ml-1 inline h-3 w-3" />
                  )}
                </TableHead>
                <TableHead className="hidden md:table-cell">Name</TableHead>
                <TableHead 
                  className="cursor-pointer text-right"
                  onClick={() => handleSort('price')}
                >
                  Price
                  {sortKey === 'price' && (
                    sortDirection === 'asc' ? <ArrowUp className="ml-1 inline h-3 w-3" /> : <ArrowDown className="ml-1 inline h-3 w-3" />
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer text-right"
                  onClick={() => handleSort('changePercent')}
                >
                  Change
                  {sortKey === 'changePercent' && (
                    sortDirection === 'asc' ? <ArrowUp className="ml-1 inline h-3 w-3" /> : <ArrowDown className="ml-1 inline h-3 w-3" />
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer text-right hidden md:table-cell"
                  onClick={() => handleSort('volume')}
                >
                  Volume
                  {sortKey === 'volume' && (
                    sortDirection === 'asc' ? <ArrowUp className="ml-1 inline h-3 w-3" /> : <ArrowDown className="ml-1 inline h-3 w-3" />
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStocks.map((stock) => (
                <TableRow 
                  key={stock.symbol} 
                  className="cursor-pointer"
                  onClick={() => handleRowClick(stock.symbol)}
                >
                  <TableCell className="font-medium">{stock.symbol}</TableCell>
                  <TableCell className="hidden md:table-cell">{stock.name}</TableCell>
                  <TableCell className="text-right">{formatNumber(stock.price)}</TableCell>
                  <TableCell className={`text-right ${getPriceChangeClass(stock.change)}`}>
                    {formatNumber(stock.change)} ({formatPercent(stock.changePercent)})
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">{abbreviateNumber(stock.volume)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockTable;
