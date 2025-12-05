import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useRealtimeData } from '@/hooks/useRealtimeData';

const COLORS = [
  'hsl(0, 85%, 55%)',    // destructive
  'hsl(38, 95%, 50%)',   // warning  
  'hsl(24, 100%, 50%)',  // primary
  'hsl(200, 100%, 45%)', // accent
  'hsl(142, 70%, 45%)',  // success
];

export function ResourceAllocationChart() {
  const { data } = useRealtimeData();
  const rawAllocationData = data.allocationData;
  const resourceAllocationData = Array.isArray(rawAllocationData) ? rawAllocationData : [];

  return (
    <div className="glass rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Resource Allocation</h3>
        <p className="text-sm text-muted-foreground mt-1">Current deployment status by category</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={resourceAllocationData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" horizontal={false} />
            <XAxis
              type="number"
              stroke="hsl(215, 20%, 55%)"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="hsl(215, 20%, 55%)"
              fontSize={12}
              tickLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220, 18%, 10%)',
                border: '1px solid hsl(220, 15%, 18%)',
                borderRadius: '8px',
                color: 'hsl(210, 40%, 98%)'
              }}
              formatter={(value) => [`${value}%`, 'Allocated']}
            />
            <Bar dataKey="allocated" radius={[0, 4, 4, 0]}>
              {resourceAllocationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
