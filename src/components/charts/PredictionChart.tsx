import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { historicalData } from '@/data/mockData';

export function PredictionChart() {
  return (
    <div className="glass rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Prediction Accuracy</h3>
        <p className="text-sm text-muted-foreground mt-1">AI model performance over time</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historicalData}>
            <defs>
              <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(24, 100%, 50%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(24, 100%, 50%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(215, 20%, 55%)" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(215, 20%, 55%)" 
              fontSize={12}
              tickLine={false}
              domain={[70, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(220, 18%, 10%)',
                border: '1px solid hsl(220, 15%, 18%)',
                borderRadius: '8px',
                color: 'hsl(210, 40%, 98%)'
              }}
              formatter={(value: number) => [`${value}%`, 'Accuracy']}
            />
            <Area 
              type="monotone" 
              dataKey="accuracy" 
              stroke="hsl(24, 100%, 50%)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorAccuracy)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
