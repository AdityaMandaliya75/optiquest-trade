
import React, { useState, useEffect } from 'react';
import { OptionChain } from '@/types/market';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatNumber, getPriceChangeClass } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface VerticalOptionChainTableProps {
  optionChain: OptionChain;
  onSelectOption: (type: 'call' | 'put', strikePrice: number) => void;
}

const VerticalOptionChainTable: React.FC<VerticalOptionChainTableProps> = ({
  optionChain,
  onSelectOption,
}) => {
  const [filter, setFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Calculate min and max strike prices
  const allStrikePrices = [...new Set([
    ...optionChain.calls.map(opt => opt.strikePrice),
    ...optionChain.puts.map(opt => opt.strikePrice)
  ])].sort((a, b) => a - b);

  // Filter strike prices based on search
  const filteredStrikePrices = allStrikePrices.filter(price => 
    filter ? price.toString().includes(filter) : true
  );

  const getCallOption = (strikePrice: number) => {
    return optionChain.calls.find(opt => opt.strikePrice === strikePrice);
  };

  const getPutOption = (strikePrice: number) => {
    return optionChain.puts.find(opt => opt.strikePrice === strikePrice);
  };

  // Get expiry date formatted
  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Filter shown options based on tab
  const strikePricesToShow = (() => {
    if (activeTab === 'all') return filteredStrikePrices;
    if (activeTab === 'itm') {
      const underlyingPrice = optionChain.underlyingPrice || 0;
      return filteredStrikePrices.filter(price => price <= underlyingPrice);
    }
    if (activeTab === 'otm') {
      const underlyingPrice = optionChain.underlyingPrice || 0;
      return filteredStrikePrices.filter(price => price > underlyingPrice);
    }
    return filteredStrikePrices;
  })();

  return (
    <Card className="overflow-hidden border-0 bg-black/5 backdrop-blur-sm">
      <div className="p-4 space-y-4 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">{optionChain.underlyingSymbol} Option Chain</h3>
            <p className="text-sm text-gray-400">
              Expiry: {formatExpiryDate(optionChain.expiryDate)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Strike Price..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-8 h-9 bg-black/20 border-slate-700 text-white w-36 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-600">All</TabsTrigger>
            <TabsTrigger value="itm" className="data-[state=active]:bg-blue-600">ITM</TabsTrigger>
            <TabsTrigger value="otm" className="data-[state=active]:bg-blue-600">OTM</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <ScrollArea className="h-[400px] pr-4">
          <Table className="w-full">
            <TableHeader className="sticky top-0 z-10 bg-black">
              <TableRow className="hover:bg-transparent border-b border-slate-700">
                <TableHead colSpan={4} className="text-center bg-blue-900/50 text-blue-200">CALLS</TableHead>
                <TableHead className="text-center bg-gray-800 text-gray-200 border-x border-slate-700">STRIKE</TableHead>
                <TableHead colSpan={4} className="text-center bg-red-900/50 text-red-200">PUTS</TableHead>
              </TableRow>
              <TableRow className="hover:bg-transparent border-b border-slate-700">
                <TableHead className="bg-blue-900/30 text-blue-200">OI</TableHead>
                <TableHead className="bg-blue-900/30 text-blue-200">Vol</TableHead>
                <TableHead className="bg-blue-900/30 text-blue-200">LTP</TableHead>
                <TableHead className="bg-blue-900/30 text-blue-200">Chg%</TableHead>
                <TableHead className="text-center bg-gray-800 text-gray-200 border-x border-slate-700"></TableHead>
                <TableHead className="bg-red-900/30 text-red-200">Chg%</TableHead>
                <TableHead className="bg-red-900/30 text-red-200">LTP</TableHead>
                <TableHead className="bg-red-900/30 text-red-200">Vol</TableHead>
                <TableHead className="bg-red-900/30 text-red-200">OI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strikePricesToShow.map((strikePrice) => {
                const call = getCallOption(strikePrice);
                const put = getPutOption(strikePrice);
                const isATM = Math.abs(strikePrice - (optionChain.underlyingPrice || 0)) < 0.5;
                
                return (
                  <TableRow 
                    key={strikePrice} 
                    className={`hover:bg-slate-700 border-b border-slate-700 ${isATM ? 'bg-blue-950/20' : ''}`}
                  >
                    {/* Call option data */}
                    <TableCell 
                      className="cursor-pointer hover:bg-blue-900/30 transition-colors" 
                      onClick={() => call && onSelectOption('call', strikePrice)}
                    >
                      {call ? formatNumber(call.openInterest) : '-'}
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer hover:bg-blue-900/30 transition-colors" 
                      onClick={() => call && onSelectOption('call', strikePrice)}
                    >
                      {call ? formatNumber(call.volume) : '-'}
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer font-semibold hover:bg-blue-900/30 transition-colors" 
                      onClick={() => call && onSelectOption('call', strikePrice)}
                    >
                      {call ? formatNumber(call.lastPrice) : '-'}
                    </TableCell>
                    <TableCell 
                      className={`cursor-pointer hover:bg-blue-900/30 transition-colors ${call ? getPriceChangeClass(call.changePercent) : ''}`}
                      onClick={() => call && onSelectOption('call', strikePrice)}
                    >
                      {call ? `${formatNumber(call.changePercent)}%` : '-'}
                    </TableCell>
                    
                    {/* Strike price column */}
                    <TableCell className={`text-center font-semibold border-x border-slate-600 ${isATM ? 'bg-blue-600/30 text-white' : 'bg-gray-800 text-gray-200'}`}>
                      {strikePrice.toFixed(2)}
                    </TableCell>
                    
                    {/* Put option data */}
                    <TableCell 
                      className={`cursor-pointer hover:bg-red-900/30 transition-colors ${put ? getPriceChangeClass(put.changePercent) : ''}`}
                      onClick={() => put && onSelectOption('put', strikePrice)}
                    >
                      {put ? `${formatNumber(put.changePercent)}%` : '-'}
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer font-semibold hover:bg-red-900/30 transition-colors" 
                      onClick={() => put && onSelectOption('put', strikePrice)}
                    >
                      {put ? formatNumber(put.lastPrice) : '-'}
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer hover:bg-red-900/30 transition-colors" 
                      onClick={() => put && onSelectOption('put', strikePrice)}
                    >
                      {put ? formatNumber(put.volume) : '-'}
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer hover:bg-red-900/30 transition-colors" 
                      onClick={() => put && onSelectOption('put', strikePrice)}
                    >
                      {put ? formatNumber(put.openInterest) : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </Card>
  );
};

export default VerticalOptionChainTable;
