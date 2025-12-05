import { useState, useEffect, useRef } from 'react';

import { MainLayout } from '@/components/layout/MainLayout';
import { AlertItem } from '@/components/dashboard/AlertItem';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { markAlertAsRead, fetchIndiaRisk } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Bell, Check, Filter } from 'lucide-react';

const Alerts = () => {
  const { data, loading } = useRealtimeData();
  const [activeFilter, setActiveFilter] = useState('All');
  const [newAlertIds, setNewAlertIds] = useState([]);
  const prevIdsRef = useRef([]);
  const [indiaRisk, setIndiaRisk] = useState(null);
  const [indiaRiskLoading, setIndiaRiskLoading] = useState(false);
  const [indiaRiskError, setIndiaRiskError] = useState(null);

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

  const handleCheckIndiaRisk = () => {
    if (!navigator.geolocation) {
      setIndiaRiskError('Geolocation is not supported in this browser.');
      return;
    }

    setIndiaRiskLoading(true);
    setIndiaRiskError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchIndiaRisk({ lat: latitude, lon: longitude })
          .then((risk) => {
            setIndiaRisk(risk);
          })
          .catch((err) => {
            setIndiaRiskError(err instanceof Error ? err.message : 'Failed to fetch India risk');
          })
          .finally(() => {
            setIndiaRiskLoading(false);
          });
      },
      (err) => {
        setIndiaRiskError(err.message || 'Failed to fetch current location.');
        setIndiaRiskLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
        <div className="glass rounded-xl p-4 md:col-span-1">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">My India Risk</p>
              <Button
                variant="outline"
                size="xs"
                className="h-7 px-2 text-[11px]"
                onClick={handleCheckIndiaRisk}
                disabled={indiaRiskLoading}
              >
                {indiaRiskLoading ? 'Checking…' : 'Check'}
              </Button>
            </div>
            {indiaRiskError && (
              <p className="text-[11px] text-destructive">{indiaRiskError}</p>
            )}
            {indiaRisk && !indiaRiskLoading && (
              <div className="text-[11px] space-y-1">
                <p className="text-muted-foreground">{indiaRisk.location}</p>
                <p className="text-foreground capitalize">{indiaRisk.type} · {indiaRisk.severity}</p>
                <p className="text-muted-foreground">
                  {(indiaRisk.probability * 100).toFixed(1)}% · {indiaRisk.riskScore.toFixed(1)}/10
                </p>
              </div>
            )}
            {!indiaRisk && !indiaRiskLoading && !indiaRiskError && (
              <p className="text-[11px] text-muted-foreground">
                Use your location to see current India risk alongside alerts.
              </p>
            )}
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