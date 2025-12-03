import { mockPredictions } from '@/data/mockData';
import { DisasterType, SeverityLevel } from '@/types/disaster';
import { cn } from '@/lib/utils';

const disasterColors: Record<DisasterType, string> = {
  earthquake: 'bg-warning',
  flood: 'bg-accent',
  hurricane: 'bg-purple-500',
  wildfire: 'bg-destructive',
  tsunami: 'bg-blue-400',
};

const severitySizes: Record<SeverityLevel, string> = {
  low: 'w-3 h-3',
  moderate: 'w-4 h-4',
  high: 'w-5 h-5',
  critical: 'w-6 h-6',
};

export function DisasterMap() {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Live Disaster Map</h3>
        <p className="text-sm text-muted-foreground mt-1">Real-time threat visualization</p>
      </div>
      
      {/* Simplified map visualization */}
      <div className="relative h-96 bg-secondary/30">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(220, 15%, 25%)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* USA outline (simplified) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60">
          <path 
            d="M 10 25 Q 15 20 25 22 Q 35 18 45 20 Q 55 15 65 18 Q 75 15 85 20 Q 90 25 88 35 Q 85 45 75 48 Q 65 52 55 50 Q 45 52 35 48 Q 25 50 15 45 Q 10 40 10 25 Z"
            fill="hsl(220, 15%, 12%)"
            stroke="hsl(220, 15%, 25%)"
            strokeWidth="0.5"
          />
        </svg>

        {/* Disaster markers */}
        {mockPredictions.map((prediction, index) => {
          // Map coordinates to viewport positions
          const positions = [
            { left: '20%', top: '35%' },   // San Francisco
            { left: '82%', top: '75%' },   // Miami
            { left: '55%', top: '70%' },   // Houston
            { left: '15%', top: '45%' },   // Los Angeles
            { left: '18%', top: '20%' },   // Seattle
          ];
          
          return (
            <div
              key={prediction.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: positions[index]?.left, top: positions[index]?.top }}
            >
              {/* Pulse effect */}
              {prediction.severity === 'critical' && (
                <div className={cn(
                  "absolute rounded-full animate-radar",
                  disasterColors[prediction.type],
                  "opacity-50 w-8 h-8 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                )} />
              )}
              
              {/* Marker */}
              <div className={cn(
                "rounded-full border-2 border-background shadow-lg transition-transform group-hover:scale-150",
                disasterColors[prediction.type],
                severitySizes[prediction.severity]
              )} />
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-card border border-border rounded-lg p-2 shadow-xl whitespace-nowrap">
                  <p className="text-xs font-semibold text-foreground capitalize">{prediction.type}</p>
                  <p className="text-xs text-muted-foreground">{prediction.location}</p>
                  <p className="text-xs text-primary font-medium">{(prediction.probability * 100).toFixed(0)}% risk</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur border border-border rounded-lg p-3">
          <p className="text-xs font-semibold text-foreground mb-2">Disaster Types</p>
          <div className="space-y-1.5">
            {Object.entries(disasterColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={cn("w-2.5 h-2.5 rounded-full", color)} />
                <span className="text-xs text-muted-foreground capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
