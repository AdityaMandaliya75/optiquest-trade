
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, Home, BarChart2, LineChart, PieChart, BookOpen, PanelLeft, Bell, ListFilter, FileText, TrendingUp, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { 
    title: 'Dashboard', 
    icon: Home, 
    path: '/dashboard' 
  },
  { 
    title: 'Markets',
    icon: BarChart2,
    children: [
      { title: 'Stocks', path: '/markets/stocks' },
      { title: 'Indices', path: '/markets/indices' },
      { title: 'Options', path: '/markets/options' },
      { title: 'Option Analytics', path: '/markets/option-analytics' }
    ]
  },
  { 
    title: 'Watchlists', 
    icon: ListFilter, 
    path: '/watchlist' 
  },
  { 
    title: 'News', 
    icon: FileText, 
    path: '/news' 
  },
  { 
    title: 'Portfolio', 
    icon: PieChart, 
    path: '/portfolio' 
  },
  { 
    title: 'Charts',
    icon: LineChart,
    children: [
      { title: 'Technical Analysis', path: '/charts/technical' },
      { title: 'Advanced Charts', path: '/charts/advanced' }
    ]
  },
  { 
    title: 'Orders', 
    icon: BookOpen, 
    path: '/orders' 
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 md:hidden"
          onClick={onClose}
        />
      )}
    
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 bottom-0 left-0 z-50 w-72 border-r bg-card transition-transform duration-300 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex h-16 items-center border-b px-6">
            <div className="flex items-center">
              <span className="text-xl font-bold">Optiquest Trade</span>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto md:hidden" onClick={onClose}>
              <PanelLeft className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid gap-1 px-2">
              {navItems.map((item, index) => (
                item.children ? (
                  <Collapsible key={index} className="w-full">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex w-full items-center justify-between px-4 py-2 h-10"
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-2 h-5 w-5" />
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-10">
                      <div className="grid gap-1 py-2">
                        {item.children.map((child, childIndex) => (
                          <NavLink
                            key={childIndex}
                            to={child.path}
                            className={({ isActive }) => cn(
                              "flex items-center px-4 py-2 text-sm rounded-md",
                              isActive ? "bg-secondary text-secondary-foreground font-medium" : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                            )}
                          >
                            {child.title}
                          </NavLink>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <NavLink
                    key={index}
                    to={item.path}
                    className={({ isActive }) => cn(
                      "flex items-center px-4 py-2 rounded-md",
                      isActive ? "bg-secondary text-secondary-foreground font-medium" : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                    )}
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    <span>{item.title}</span>
                  </NavLink>
                )
              ))}
            </nav>
          </div>
          
          {/* Footer */}
          <div className="mt-auto p-4 border-t">
            <div className="rounded-md bg-secondary p-4">
              <p className="text-sm font-medium">Demo Account</p>
              <p className="text-xs text-muted-foreground mt-1">Balance: ₹10,00,000</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
