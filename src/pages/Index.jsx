import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Activity, Package, Users, Shield, TrendingUp, ArrowRight, Cpu } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const Index = () => {
  const { data, loading, error } = useRealtimeData();
  const navigate = useNavigate();

  if (loading) {
    return (
      <MainLayout title="Command Center" subtitle="Real-time disaster monitoring and response coordination">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading real-time data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Command Center" subtitle="Real-time disaster monitoring and response coordination">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-2">Error loading data</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground mt-4">Make sure the backend server is running on port 3001</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const stats = data.stats || { activeAlerts: 0, predictedDisasters: 0, resourcesDeployed: 0, populationAtRisk: 0, responseTeams: 0, successRate: 0 };
  const insights = data.insights || {};

  return (
    <MainLayout title="Command Center" subtitle="Real-time disaster monitoring and response coordination">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-12 animate-in fade-in duration-500">
        <StatCard
          title="Active Alerts"
          value={stats.activeAlerts}
          change="+2 from yesterday"
          changeType="negative"
          icon={AlertTriangle}
          iconColor="destructive"
        />
        <StatCard
          title="Predicted Events"
          value={stats.predictedDisasters}
          change="Next 7 days"
          changeType="neutral"
          icon={Activity}
          iconColor="warning"
        />
        <StatCard
          title="Resources Deployed"
          value={stats.resourcesDeployed}
          change="+124 today"
          changeType="positive"
          icon={Package}
          iconColor="accent"
        />
        <StatCard
          title="Population at Risk"
          value={`${(stats.populationAtRisk / 1000000).toFixed(1)}M`}
          change="Across 5 regions"
          changeType="neutral"
          icon={Users}
          iconColor="primary"
        />
        <StatCard
          title="Response Teams"
          value={stats.responseTeams}
          change="98% ready"
          changeType="positive"
          icon={Shield}
          iconColor="success"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <StatCard
                title="Prediction Accuracy"
                value={`${stats.successRate.toFixed(1)}%`}
                change="% of past predictions that matched actual events"
                changeType="neutral"
                icon={TrendingUp}
                iconColor="success"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            Prediction accuracy: percentage of past AI predictions that aligned with real-world disaster outcomes.
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="glass rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground tracking-wide mb-1">AI MODEL STATUS</p>
            <p className="text-lg font-semibold text-foreground">{insights.modelName || 'SwiftGrid Risk Model'}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Version {insights.modelVersion || '2.4.1'}  Last sync {insights.lastUpdated || '2 min ago'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-success font-medium">Online</span>
            </div>
            <p className="text-sm text-muted-foreground">Confidence</p>
            <p className="text-2xl font-bold text-foreground">
              {Math.round((insights.modelConfidence ?? stats.successRate) || 0)}%
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Quick Access</h2>
        <p className="text-sm text-muted-foreground">Navigate to key sections of the disaster response system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="group relative glass rounded-2xl p-8 cursor-pointer hover:border-destructive/50 transition-all duration-300 hover:shadow-lg hover:shadow-destructive/20 hover:-translate-y-1"
          onClick={() => navigate('/alerts')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full blur-3xl group-hover:bg-destructive/10 transition-all duration-300" />
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/5 group-hover:from-destructive/30 group-hover:to-destructive/10 transition-all duration-300">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">Alert Center</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-destructive">{data.alertStats?.unread || 0}</span>
                  <span className="text-sm text-muted-foreground">unread</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Monitor and manage emergency notifications in real-time
            </p>
            <div className="flex items-center text-sm text-primary group-hover:text-destructive transition-colors">
              <span className="font-medium">View alerts</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        <div
          className="group relative glass rounded-2xl p-8 cursor-pointer hover:border-warning/50 transition-all duration-300 hover:shadow-lg hover:shadow-warning/20 hover:-translate-y-1"
          onClick={() => navigate('/predictions')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full blur-3xl group-hover:bg-warning/10 transition-all duration-300" />
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 group-hover:from-warning/30 group-hover:to-warning/10 transition-all duration-300">
                <Activity className="w-8 h-8 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">Predictions</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-warning">{stats.predictedDisasters}</span>
                  <span className="text-sm text-muted-foreground">events</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              AI-powered disaster forecasting and risk analysis
            </p>
            <div className="flex items-center text-sm text-primary group-hover:text-warning transition-colors">
              <span className="font-medium">View predictions</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        <div
          className="group relative glass rounded-2xl p-8 cursor-pointer hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-1"
          onClick={() => navigate('/resources')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all duration-300" />
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 group-hover:from-accent/30 group-hover:to-accent/10 transition-all duration-300">
                <Package className="w-8 h-8 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">Resources</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-accent">{stats.resourcesDeployed}</span>
                  <span className="text-sm text-muted-foreground">deployed</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Track and allocate emergency response resources
            </p>
            <div className="flex items-center text-sm text-primary group-hover:text-accent transition-colors">
              <span className="font-medium">Manage resources</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;