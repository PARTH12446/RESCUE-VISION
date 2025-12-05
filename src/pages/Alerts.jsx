import { useState, useEffect, useRef } from 'react';

import { MainLayout } from '@/components/layout/MainLayout';
import { AlertItem } from '@/components/dashboard/AlertItem';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { markAlertAsRead } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Bell, Check, Filter } from 'lucide-react';

const Alerts = () => {
  const { data, loading } = useRealtimeData();
  const [activeFilter, setActiveFilter] = useState('All');
  const [newAlertIds, setNewAlertIds] = useState([]);
  const prevIdsRef = useRef([]);

  const alerts = Array.isArray(data.alerts) ? data.alerts : [];

  const alertStats = data.alertStats || { total: 0, unread: 0, critical: 0, resolvedToday: 0 };

  useEffect(() => {
    const currentIds = alerts.map((a) => a.id).filter(Boolean);
    const prevIds = prevIdsRef.current || [];

    const added = currentIds.filter((id) => !prevIds.includes(id));

    if (added.length > 0) {
      setNewAlertIds((prev) => {
        const merged = [...added, ...prev];
        return Array.from(new Set(merged)).slice(0, 100);
      });

      added.forEach((id) => {
        setTimeout(() => {
          setNewAlertIds((prev) => prev.filter((x) => x !== id));
        }, 3000);
      });
    }

    prevIdsRef.current = currentIds;
  }, [alerts]);

  const filteredAlerts = alerts.filter(alert => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return !alert.isRead;
    if (activeFilter === 'Critical') return alert.severity === 'critical';
    if (activeFilter === 'High') return alert.severity === 'high';
    if (activeFilter === 'Moderate') return alert.severity === 'medium';

    return true;
  });

  const handleMarkAsRead = async (id) => {
    try {
      await markAlertAsRead(id);
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadAlerts = alerts.filter(a => !a.isRead);
      await Promise.all(unreadAlerts.map(alert => markAlertAsRead(alert.id)));
    } catch (error) {
      console.error('Failed to mark all alerts as read:', error);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Alert Center" subtitle="Emergency notifications and warnings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Alert Center" subtitle="Emergency notifications and warnings">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/20">
              <Bell className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{alertStats.total}</p>
              <p className="text-sm text-muted-foreground">Total Alerts</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{alertStats.unread}</p>
              <p className="text-sm text-muted-foreground">Unread</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20">
              <Bell className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{alertStats.critical}</p>
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/20">
              <Check className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{alertStats.resolvedToday}</p>
              <p className="text-sm text-muted-foreground">Resolved Today</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <div className="flex gap-2">
            {['All', 'Unread', 'Critical', 'High', 'Medium'].map(filter => (
              <Button
                key={filter}
                variant={filter === activeFilter ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
          Mark all as read
        </Button>
      </div>

      <div className="space-y-3">
        {filteredAlerts.map(alert => (
          <div key={alert.id} onClick={() => !alert.isRead && handleMarkAsRead(alert.id)} className="cursor-pointer">
            <AlertItem alert={alert} isNew={newAlertIds.includes(alert.id)} />
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

export default Alerts;