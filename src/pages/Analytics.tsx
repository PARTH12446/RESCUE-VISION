import { MainLayout } from '@/components/layout/MainLayout';
import { PredictionChart } from '@/components/charts/PredictionChart';
import { ResourceAllocationChart } from '@/components/charts/ResourceAllocationChart';
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

const responseTimeData = [
  { day: 'Mon', time: 12 },
  { day: 'Tue', time: 8 },
  { day: 'Wed', time: 15 },
  { day: 'Thu', time: 6 },
  { day: 'Fri', time: 9 },
  { day: 'Sat', time: 11 },
  { day: 'Sun', time: 7 },
];

const disasterTypeData = [
  { name: 'Flood', value: 35 },
  { name: 'Earthquake', value: 25 },
  { name: 'Hurricane', value: 20 },
  { name: 'Wildfire', value: 15 },
  { name: 'Tsunami', value: 5 },
];

const COLORS = ['hsl(200, 100%, 45%)', 'hsl(38, 95%, 50%)', 'hsl(280, 70%, 50%)', 'hsl(0, 85%, 55%)', 'hsl(142, 70%, 45%)'];

const Analytics = () => {
  return (
    <MainLayout 
      title="Analytics Dashboard" 
      subtitle="Performance metrics and insights"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-xl p-6">
          <p className="text-sm text-muted-foreground">Avg Response Time</p>
          <p className="text-3xl font-bold text-foreground mt-2">8.4 min</p>
          <p className="text-sm text-success mt-1">↓ 23% vs last month</p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-sm text-muted-foreground">Prediction Accuracy</p>
          <p className="text-3xl font-bold text-foreground mt-2">94.7%</p>
          <p className="text-sm text-success mt-1">↑ 2.3% vs last month</p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-sm text-muted-foreground">Lives Protected</p>
          <p className="text-3xl font-bold text-foreground mt-2">1.2M</p>
          <p className="text-sm text-muted-foreground mt-1">This quarter</p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-sm text-muted-foreground">Resource Efficiency</p>
          <p className="text-3xl font-bold text-foreground mt-2">89%</p>
          <p className="text-sm text-success mt-1">↑ 5% vs last month</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PredictionChart />
        <ResourceAllocationChart />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Chart */}
        <div className="glass rounded-xl p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Response Time Trend</h3>
            <p className="text-sm text-muted-foreground mt-1">Average emergency response time (minutes)</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeData}>
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
                  formatter={(value: number) => [`${value} min`, 'Response Time']}
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

        {/* Disaster Type Distribution */}
        <div className="glass rounded-xl p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Disaster Type Distribution</h3>
            <p className="text-sm text-muted-foreground mt-1">Breakdown by category (last 30 days)</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={disasterTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {disasterTypeData.map((entry, index) => (
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
                  formatter={(value: number) => [`${value}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {disasterTypeData.map((item, index) => (
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
