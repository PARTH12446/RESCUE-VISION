import { MainLayout } from '@/components/layout/MainLayout';
import { AlertItem } from '@/components/dashboard/AlertItem';
import { mockAlerts } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Bell, Check, Filter } from 'lucide-react';

const Alerts = () => {
  const unreadCount = mockAlerts.filter(a => !a.isRead).length;
  
  return (
    <MainLayout 
      title="Alert Center" 
      subtitle="Emergency notifications and warnings"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/20">
              <Bell className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockAlerts.length}</p>
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
              <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
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
              <p className="text-2xl font-bold text-foreground">2</p>
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
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-sm text-muted-foreground">Resolved Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <div className="flex gap-2">
            {['All', 'Unread', 'Critical', 'High', 'Moderate'].map(filter => (
              <Button 
                key={filter} 
                variant={filter === 'All' ? 'default' : 'ghost'} 
                size="sm"
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="sm">Mark all as read</Button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {mockAlerts.map(alert => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </div>
    </MainLayout>
  );
};

export default Alerts;
