import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  Info, 
  MessageSquare,
  X,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  application_id?: string;
}

interface RealTimeNotificationProps {
  userId: string;
}

export function RealTimeNotificationModule({ userId }: RealTimeNotificationProps) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const mockNotifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Application Status Update',
      message: 'Your B.Tech Computer Science application has moved to Expert Review stage.',
      type: 'info',
      is_read: false,
      created_at: '2024-09-22T10:30:00Z',
      application_id: 'APP-2024-001'
    },
    {
      id: '2',
      title: 'Document Verification Complete',
      message: 'All submitted documents have been verified successfully with 95% confidence score.',
      type: 'success',
      is_read: false,
      created_at: '2024-09-22T09:15:00Z',
      application_id: 'APP-2024-001'
    },
    {
      id: '3',
      title: 'Expert Assignment',
      message: 'Dr. Rajesh Kumar has been assigned as the evaluator for your application.',
      type: 'info',
      is_read: true,
      created_at: '2024-09-21T16:45:00Z',
      application_id: 'APP-2024-001'
    },
    {
      id: '4',
      title: 'Missing Documents',
      message: 'Additional infrastructure documents are required for your M.Tech application.',
      type: 'warning',
      is_read: false,
      created_at: '2024-09-21T14:20:00Z',
      application_id: 'APP-2024-002'
    },
    {
      id: '5',
      title: 'Payment Confirmation',
      message: 'Payment received and verified. Processing will begin shortly.',
      type: 'success',
      is_read: true,
      created_at: '2024-09-20T11:30:00Z',
      application_id: 'APP-2024-001'
    }
  ];

  // Simulate WebSocket connection for real-time updates
  useEffect(() => {
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
    
    // Simulate WebSocket connection
    const connectWebSocket = () => {
      setIsConnected(true);
      
      // Simulate real-time notification
      const simulateNotification = () => {
        const newNotification: NotificationItem = {
          id: Date.now().toString(),
          title: 'Real-time Update',
          message: 'This is a simulated real-time notification via WebSocket.',
          type: 'info',
          is_read: false,
          created_at: new Date().toISOString()
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        toast({
          title: newNotification.title,
          description: newNotification.message,
        });
      };

      // Simulate receiving a notification every 30 seconds
      const interval = setInterval(simulateNotification, 30000);
      
      return () => {
        clearInterval(interval);
        setIsConnected(false);
      };
    };

    const cleanup = connectWebSocket();
    return cleanup;
  }, [userId, toast]);

  // Real Supabase realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as NotificationItem;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, toast]);

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertCircle;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-destructive';
      default: return 'text-primary';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Real-Time Notification Module
            {isConnected && (
              <Badge variant="outline" className="bg-success/10 text-success">
                Connected
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          WebSocket-powered real-time alerts for application status and evaluator feedback
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark All Read
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Recent' : 'Show All'}
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {displayedNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            displayedNotifications.map((notification) => {
              const NotificationIcon = getNotificationIcon(notification.type);
              
              return (
                <div 
                  key={notification.id} 
                  className={`border rounded-lg p-4 transition-all ${
                    !notification.is_read ? 'bg-muted/30 border-primary/20' : 'bg-background'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <NotificationIcon 
                        className={`h-5 w-5 mt-0.5 ${getNotificationColor(notification.type)}`} 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                          {notification.application_id && (
                            <Badge variant="outline" className="text-xs">
                              {notification.application_id}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.is_read && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Connection Status */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'}`} />
              <span className="text-sm">
                WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time updates via Socket.IO
            </p>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-2">Notification Features</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">Push Notifications</p>
              <p className="text-muted-foreground">Real-time WebSocket updates</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Status Changes</p>
              <p className="text-muted-foreground">Application progress alerts</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Evaluator Feedback</p>
              <p className="text-muted-foreground">Comments and review updates</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Deadline Reminders</p>
              <p className="text-muted-foreground">Automatic deadline notifications</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}