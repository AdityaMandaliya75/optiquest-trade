
import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell } from 'lucide-react';
import { Notification } from '@/types/market';
import { useNotifications } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  
  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };
  
  const handleMarkAllRead = () => {
    markAllRead();
  };
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'price_alert':
        return <span className="text-blue-500">₹</span>;
      case 'news_alert':
        return <span className="text-green-500">N</span>;
      case 'volume_spike':
        return <span className="text-orange-500">V</span>;
      default:
        return <span className="text-gray-500">I</span>;
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex justify-between items-center border-b p-3">
          <h3 className="font-medium">Notifications</h3>
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            Mark all read
          </Button>
        </div>
        
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full p-4">
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`
                    p-3 border-b last:border-0 flex items-start gap-3 cursor-pointer
                    ${!notification.read ? 'bg-muted/40' : ''}
                  `}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className={`
                    h-8 w-8 rounded-full flex items-center justify-center text-white
                    ${notification.type === 'price_alert' ? 'bg-blue-500' : 
                      notification.type === 'news_alert' ? 'bg-green-500' : 
                      notification.type === 'volume_spike' ? 'bg-orange-500' : 'bg-gray-500'}
                  `}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
