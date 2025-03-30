
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Search, Bell, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/context/AuthContext';
import { searchStocks } from '@/services/realTimeMarketService';
import { Stock } from '@/types/market';

interface NavBarProps {
  toggleSidebar: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ toggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      const results = await searchStocks(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSelectStock = (symbol: string) => {
    setSearchQuery('');
    setShowSearchResults(false);
    navigate(`/markets/stocks/${symbol}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center md:hidden mr-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 sm:max-w-xs">
              <nav className="grid gap-2 py-6">
                <Link
                  to="/dashboard"
                  className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline text-muted-foreground"
                >
                  Dashboard
                </Link>
                <Link
                  to="/markets/stocks"
                  className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline text-muted-foreground"
                >
                  Stocks
                </Link>
                <Link
                  to="/markets/indices"
                  className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline text-muted-foreground"
                >
                  Indices
                </Link>
                <Link
                  to="/portfolio"
                  className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline text-muted-foreground"
                >
                  Portfolio
                </Link>
                <Link
                  to="/orders"
                  className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline text-muted-foreground"
                >
                  Orders
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        
        <Link to="/dashboard" className="flex items-center space-x-2 mr-4">
          <span className="font-bold inline-block">TradeSim</span>
        </Link>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2 hidden md:flex" 
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for stocks..."
            className="w-full pl-8 md:w-[300px] lg:w-[400px]"
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
          />
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-md border bg-popover p-2 shadow-md">
              {searchResults.slice(0, 5).map((stock) => (
                <div
                  key={stock.symbol}
                  className="cursor-pointer rounded-sm px-2 py-1.5 hover:bg-accent"
                  onMouseDown={() => handleSelectStock(stock.symbol)}
                >
                  <div className="font-medium">{stock.symbol}</div>
                  <div className="text-xs text-muted-foreground">{stock.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1 ml-auto">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-primary"></span>
            <span className="sr-only">Notifications</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/profile" className="w-full">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/settings" className="w-full">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
