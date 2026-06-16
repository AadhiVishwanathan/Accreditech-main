import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertCircle, Info, XCircle, Eye, Users, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  application_id: string | null;
  is_read: boolean;
  created_at: string;
}

export function NotificationsPanel() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) {
      console.log('No user found for notifications');
      return;
    }

    console.log('Fetching notifications for user:', user.id);

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      console.log('Fetched notifications:', data);
      setNotifications((data || []) as Notification[]);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    console.log('NotificationsPanel useEffect triggered, user:', user?.id);
    fetchNotifications();

    if (!user) return;

    // Set up real-time subscription
    console.log('Setting up real-time subscription for user:', user.id);
    const channel = supabase
      .channel('institute-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up notification subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getIcon = (type: string, title: string) => {
    if (title.includes('Expert Visit Committee')) return Users;
    if (title.includes('Visit') || title.includes('Schedule')) return Calendar;
    
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return AlertCircle;
      default: return Info;
    }
  };

  const getIconColor = (type: string, title: string) => {
    if (title.includes('Expert Visit Committee')) return 'text-blue-600';
    if (title.includes('Visit') || title.includes('Schedule')) return 'text-purple-600';
    
    switch (type) {
      case 'success': return 'text-success';
      case 'error': return 'text-destructive';
      case 'warning': return 'text-warning';
      default: return 'text-primary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading notifications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
            >
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No notifications yet
          </p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => {
              const Icon = getIcon(notification.type, notification.title);
              return (
                <div key={notification.id}>
                  <div 
                    className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                      !notification.is_read 
                        ? 'bg-primary/5 border border-primary/20' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mt-0.5 ${getIconColor(notification.type, notification.title)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <Badge variant={getTypeColor(notification.type)} className="text-xs">
                          {notification.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 whitespace-pre-line">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs h-auto p-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator className="my-2" />}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}