import { useEffect, useState } from 'react';
import { Alert as AlertComponent, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, X, Check, Eye, Bell, BellOff, Info as InfoIcon } from 'lucide-react';
import { mockAlerts } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export function RealTimeAlerts({
  maxAlerts = 5,
  autoDismiss = true,
  dismissTime = 10000,
} = {}) {
  const [alerts, setAlerts] = useState([]);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const { toast } = useToast();

  // Simulate real-time alerts
  useEffect(() => {
    // Initial load
    setAlerts(mockAlerts.slice(0, maxAlerts));

    // Simulate new alerts
    const interval = setInterval(() => {
      const newAlert = {
        ...mockAlerts[Math.floor(Math.random() * mockAlerts.length)],
        id: `alert-${Date.now()}`,
        timestamp: new Date(),
      };
      
      setAlerts(prev => [newAlert, ...prev].slice(0, maxAlerts));
      
      // Show toast notification for new alerts
      toast({
        title: `New Alert: ${newAlert.type.toUpperCase()}`,
        description: newAlert.message,
        variant: getVariantFromSeverity(newAlert.severity),
      });
    }, 30000); // New alert every 30 seconds

    return () => clearInterval(interval);
  }, [maxAlerts, toast]);

  const getVariantFromSeverity = (severity) => {
    return severity === 'destructive' ? 'destructive' : 'default';
  };

  const getIcon = (severity) => {
    const isCritical = severity === 'critical' || severity === 'high';
    return isCritical 
      ? <AlertCircle className="h-4 w-4" /> 
      : <InfoIcon className="h-4 w-4" />;
  };

  const handleDismiss = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    toast({
      title: 'Alert dismissed',
      description: 'The alert has been removed',
    });
  };

  const handleMarkAsRead = (id) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, isRead: true } : alert
      )
    );
  };

  const handleViewDetails = (alert) => {
    if (expandedAlert === alert.id) {
      setExpandedAlert(null);
    } else {
      setExpandedAlert(alert.id);
      // Mark as read when viewing details
      if (!alert.isRead) {
        handleMarkAsRead(alert.id);
      }
    }
  };

  const toggleMute = (id) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, isMuted: !alert.isMuted } : alert
      )
    );
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertComponent
          key={alert.id}
          variant={getVariantFromSeverity(alert.severity)}
          className={cn(
            'animate-fade-in transition-all duration-200 overflow-hidden',
            expandedAlert === alert.id ? 'max-h-96' : 'max-h-32',
            alert.isRead ? 'opacity-80' : 'border-l-4 border-l-primary'
          )}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3 mt-0.5">
              {getIcon(alert.severity)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <AlertTitle className="font-medium text-sm">
                  {alert.title || alert.type.toUpperCase()}
                </AlertTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => toggleMute(alert.id)}
                    title={alert.isMuted ? 'Unmute' : 'Mute'}
                  >
                    {alert.isMuted ? (
                      <BellOff className="h-3.5 w-3.5" />
                    ) : (
                      <Bell className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDismiss(alert.id)}
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <AlertDescription className="text-sm mt-1">
                {alert.message}
              </AlertDescription>
              
              {expandedAlert === alert.id && (
                <div className="mt-2 p-3 bg-muted/20 rounded-md text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-muted-foreground text-xs">Location</p>
                      <p className="font-medium">{alert.location || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Severity</p>
                      <p className="font-medium capitalize">{alert.severity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Time</p>
                      <p className="font-medium">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
                <div className="flex space-x-2">
                  {!alert.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleMarkAsRead(alert.id)}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    variant={expandedAlert === alert.id ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleViewDetails(alert)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    {expandedAlert === alert.id ? 'Hide Details' : 'View Details'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </AlertComponent>
      ))}
    </div>
  );
}
