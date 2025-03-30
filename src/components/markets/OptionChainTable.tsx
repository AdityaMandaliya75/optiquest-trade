
import React, { useState } from 'react';
import { OptionChain } from '@/types/market';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber, formatPercent, getPriceChangeClass, formatOptionExpiryDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

interface OptionChainTableProps {
  optionChain: OptionChain;
  onSelectOption?: (type: 'call' | 'put', strikePrice: number) => void;
}

const OptionChainTable: React.FC<OptionChainTableProps> = ({ optionChain, onSelectOption }) => {
  const [filter, setFilter] = useState('');
  
  const filteredChain = {
    ...optionChain,
    calls: optionChain.calls.filter(call => 
      call.strikePrice.toString().includes(filter)
    ),
    puts: optionChain.puts.filter(put => 
      put.strikePrice.toString().includes(filter)
    )
  };
  
  // Find all unique strike prices across both calls and puts
  const strikeSet = new Set([
    ...filteredChain.calls.map(call => call.strikePrice),
    ...filteredChain.puts.map(put => put.strikePrice)
  ]);
  const sortedStrikes = Array.from(strikeSet).sort((a, b) => a - b);
  
  // Create a map for quick lookup of options by strike price
  const callMap = new Map(filteredChain.calls.map(call => [call.strikePrice, call]));
  const putMap = new Map(filteredChain.puts.map(put => [put.strikePrice, put]));
  
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <CardTitle>{optionChain.underlyingSymbol} Option Chain</CardTitle>
            <p className="text-sm text-muted-foreground">Expiry: {formatOptionExpiryDate(optionChain.expiryDate)}</p>
          </div>
          <div className="relative w-[150px]">
            <Input
              type="text"
              placeholder="Filter strikes..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="stock-table w-full">
            <TableHeader>
              <TableRow>
                <TableHead colSpan={4} className="text-center bg-blue-950">CALLS</TableHead>
                <TableHead className="text-center">STRIKE</TableHead>
                <TableHead colSpan={4} className="text-center bg-red-950">PUTS</TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Chg%</TableHead>
                <TableHead className="text-right hidden md:table-cell">Vol</TableHead>
                <TableHead className="text-right hidden md:table-cell">OI</TableHead>
                <TableHead className="text-center font-bold">Strike</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Chg%</TableHead>
                <TableHead className="text-right hidden md:table-cell">Vol</TableHead>
                <TableHead className="text-right hidden md:table-cell">OI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStrikes.map(strike => {
                const call = callMap.get(strike);
                const put = putMap.get(strike);
                
                return (
                  <TableRow key={strike}>
                    {/* Call side */}
                    <TableCell
                      className={`text-right ${call ? 'cursor-pointer hover:bg-blue-950/20' : ''}`}
                      onClick={() => call && onSelectOption && onSelectOption('call', strike)}
                    >
                      {call ? formatNumber(call.lastPrice) : '-'}
                    </TableCell>
                    <TableCell 
                      className={`text-right ${call ? getPriceChangeClass(call.change) : ''} ${call ? 'cursor-pointer hover:bg-blue-950/20' : ''}`}
                      onClick={() => call && onSelectOption && onSelectOption('call', strike)}
                    >
                      {call ? formatPercent(call.changePercent) : '-'}
                    </TableCell>
                    <TableCell 
                      className={`text-right hidden md:table-cell ${call ? 'cursor-pointer hover:bg-blue-950/20' : ''}`}
                      onClick={() => call && onSelectOption && onSelectOption('call', strike)}
                    >
                      {call ? formatNumber(call.volume) : '-'}
                    </TableCell>
                    <TableCell 
                      className={`text-right hidden md:table-cell ${call ? 'cursor-pointer hover:bg-blue-950/20' : ''}`}
                      onClick={() => call && onSelectOption && onSelectOption('call', strike)}
                    >
                      {call ? formatNumber(call.openInterest) : '-'}
                    </TableCell>
                    
                    {/* Strike price */}
                    <TableCell className="text-center font-semibold bg-secondary">
                      {formatNumber(strike)}
                    </TableCell>
                    
                    {/* Put side */}
                    <TableCell 
                      className={`text-right ${put ? 'cursor-pointer hover:bg-red-950/20' : ''}`}
                      onClick={() => put && onSelectOption && onSelectOption('put', strike)}
                    >
                      {put ? formatNumber(put.lastPrice) : '-'}
                    </TableCell>
                    <TableCell 
                      className={`text-right ${put ? getPriceChangeClass(put.change) : ''} ${put ? 'cursor-pointer hover:bg-red-950/20' : ''}`}
                      onClick={() => put && onSelectOption && onSelectOption('put', strike)}
                    >
                      {put ? formatPercent(put.changePercent) : '-'}
                    </TableCell>
                    <TableCell 
                      className={`text-right hidden md:table-cell ${put ? 'cursor-pointer hover:bg-red-950/20' : ''}`}
                      onClick={() => put && onSelectOption && onSelectOption('put', strike)}
                    >
                      {put ? formatNumber(put.volume) : '-'}
                    </TableCell>
                    <TableCell 
                      className={`text-right hidden md:table-cell ${put ? 'cursor-pointer hover:bg-red-950/20' : ''}`}
                      onClick={() => put && onSelectOption && onSelectOption('put', strike)}
                    >
                      {put ? formatNumber(put.openInterest) : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptionChainTable;
