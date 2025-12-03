import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DisasterCard } from '@/components/dashboard/DisasterCard';
import { AlertItem } from '@/components/dashboard/AlertItem';
import { ResourceBar } from '@/components/dashboard/ResourceBar';
import { PredictionChart } from '@/components/charts/PredictionChart';
import { ResourceAllocationChart } from '@/components/charts/ResourceAllocationChart';
import { DisasterMap } from '@/components/map/DisasterMap';
import { mockPredictions, mockAlerts, mockResources, mockDashboardStats } from '@/data/mockData';
import { AlertTriangle, Activity, Package, Users, Shield, TrendingUp } from 'lucide-react';

const Index = () => {
  const criticalPredictions = mockPredictions.filter(p => p.severity === 'critical' || p.severity === 'high').slice(0, 3);
  const recentAlerts = mockAlerts.slice(0, 3);
  const topResources = mockResources.slice(0, 4);

  return (
    <MainLayout title="Command Center" subtitle="Real-time disaster monitoring and response coordination">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard title="Active Alerts" value={mockDashboardStats.activeAlerts} change="+2 from yesterday" changeType="negative" icon={AlertTriangle} iconColor="destructive" />
        <StatCard title="Predicted Events" value={mockDashboardStats.predictedDisasters} change="Next 7 days" changeType="neutral" icon={Activity} iconColor="warning" />
        <StatCard title="Resources Deployed" value={mockDashboardStats.resourcesDeployed} change="+124 today" changeType="positive" icon={Package} iconColor="accent" />
        <StatCard title="Population at Risk" value={`${(mockDashboardStats.populationAtRisk / 1000000).toFixed(1)}M`} change="Across 5 regions" changeType="neutral" icon={Users} iconColor="primary" />
        <StatCard title="Response Teams" value={mockDashboardStats.responseTeams} change="98% ready" changeType="positive" icon={Shield} iconColor="success" />
        <StatCard title="Success Rate" value={`${mockDashboardStats.successRate}%`} change="+2.3% this month" changeType="positive" icon={TrendingUp} iconColor="success" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2"><DisasterMap /></div>
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-foreground">Recent Alerts</h3><span className="text-xs text-muted-foreground">View all →</span></div>
          <div className="space-y-3">{recentAlerts.map(alert => <AlertItem key={alert.id} alert={alert} />)}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"><PredictionChart /><ResourceAllocationChart /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-foreground">High Priority Threats</h3><span className="text-xs text-muted-foreground">View all →</span></div><div className="space-y-4">{criticalPredictions.map(prediction => <DisasterCard key={prediction.id} prediction={prediction} />)}</div></div>
        <div><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-foreground">Resource Status</h3><span className="text-xs text-muted-foreground">View all →</span></div><div className="space-y-3">{topResources.map(resource => <ResourceBar key={resource.id} resource={resource} />)}</div></div>
      </div>
    </MainLayout>
  );
};

export default Index;
