import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PredictionChart } from '@/components/charts/PredictionChart';
import { ResourceAllocationChart } from '@/components/charts/ResourceAllocationChart';
import { fetchAnalytics } from '@/services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['hsl(200, 100%, 45%)', 'hsl(38, 95%, 50%)', 'hsl(280, 70%, 50%)', 'hsl(0, 85%, 55%)', 'hsl(142, 70%, 45%)'];

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await fetchAnalytics();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();

    const interval = setInterval(loadAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !analyticsData) {
    return (
      <MainLayout title="Analytics Dashboard" subtitle="Performance metrics and insights">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Analytics Dashboard"
      subtitle="Performance metrics and insights"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-xl p-6">
          <p className="text-sm text-muted-foreground">Avg Response Time</p>
          <p className="text-3xl font-bold text-foreground mt-2">{analyticsData.kpis?.avgResponseTime?.toFixed(1) || 0} min</p>
          <p className="text-sm text-success mt-1">↓ 23% vs last month</p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-sm text-muted-foreground">Prediction Accuracy</p>
          <p className="text-3xl font-bold text-foreground mt-2">{analyticsData.kpis?.predictionAccuracy?.toFixed(1) || 0}%</p>
          <p className="text-sm text-success mt-1">↑ 2.3% vs last month</p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-sm text-muted-foreground">Lives Protected</p>
          <p className="text-3xl font-bold text-foreground mt-2">{((analyticsData.kpis?.livesProtected || 0) / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-muted-foreground mt-1">This quarter</p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-sm text-muted-foreground">Resource Efficiency</p>
          <p className="text-3xl font-bold text-foreground mt-2">{analyticsData.kpis?.resourceEfficiency?.toFixed(0) || 0}%</p>
          <p className="text-sm text-success mt-1">↑ 5% vs last month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PredictionChart />
        <ResourceAllocationChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Response Time Trend</h3>
            <p className="text-sm text-muted-foreground mt-1">Average emergency response time (minutes)</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                <XAxis dataKey="day" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(220, 18%, 10%)',
                    border: '1px solid hsl(220, 15%, 18%)',
                    borderRadius: '8px',
                    color: 'hsl(210, 40%, 98%)'
                  }}
                  formatter={(value) => [`${value} min`, 'Response Time']}
                />
                <Line
                  type="monotone"
                  dataKey="time"
                  stroke="hsl(200, 100%, 45%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(200, 100%, 45%)', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Disaster Type Distribution</h3>
            <p className="text-sm text-muted-foreground mt-1">Breakdown by category (last 30 days)</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.disasterTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analyticsData.disasterTypeData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(220, 18%, 10%)',
                    border: '1px solid hsl(220, 15%, 18%)',
                    borderRadius: '8px',
                    color: 'hsl(210, 40%, 98%)'
                  }}
                  formatter={(value) => [`${value}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {analyticsData.disasterTypeData?.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;