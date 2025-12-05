import { cn } from '@/lib/utils';

const disasterColors = {
  earthquake: 'bg-warning',
  flood: 'bg-accent',
  hurricane: 'bg-purple-500',
  wildfire: 'bg-destructive',
  tsunami: 'bg-blue-400',
};

const severitySizes = {
  low: 'w-3 h-3',
  moderate: 'w-4 h-4',
  high: 'w-5 h-5',
  critical: 'w-6 h-6',
};

export function DisasterMap({ predictions = [], reportedDisasters = [] } = {}) {
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

        {/* Predicted disaster markers */}
        {predictions?.map((prediction, index) => {
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
              key={`prediction-${prediction.id}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: positions[index]?.left, top: positions[index]?.top }}
            >
              {/* Pulse effect */}
              {prediction.severity === 'critical' && (
                <div className={cn(
                  "absolute rounded-full animate-pulse",
                  disasterColors[prediction.type],
                  "opacity-30 w-8 h-8 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                )} />
              )}
              
              {/* Marker */}
              <div className={cn(
                "rounded-full border-2 border-background shadow-lg transition-transform group-hover:scale-150",
                disasterColors[prediction.type],
                severitySizes[prediction.severity]
              )}>
                <span className="sr-only">{prediction.type} in {prediction.location}</span>
              </div>
              
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
        
        {/* Reported disaster markers */}
        {reportedDisasters.map((report) => {
          const color = disasterColors[report.type] || 'bg-gray-400';
          const size = severitySizes[report.severity];
          
          // Convert lat/lng to viewBox coordinates (simplified)
          const left = 10 + (report.coordinates.lng + 125) * 0.7;
          const top = 10 + (45 - report.coordinates.lat) * 1.2;
          
          return (
            <div 
              key={`report-${report.id}`}
              className={cn(
                'absolute rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2',
                color,
                size,
                'flex items-center justify-center text-white font-bold text-xs',
                'cursor-pointer hover:scale-125 transition-transform',
                'group',
                'ring-2 ring-offset-2 ring-offset-background',
                report.status === 'verified' ? 'ring-green-500' :
                report.status === 'under_review' ? 'ring-yellow-500' :
                report.status === 'resolved' ? 'ring-blue-500' : 'ring-red-500'
              )}
              style={{ left: `${left}%`, top: `${top}%` }}
              title={`${report.title} (${report.severity}) - ${report.location}`}
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] leading-none">
                {report.type === 'other' ? 'R' : report.type.charAt(0).toUpperCase()}
              </span>
              
              {/* Status indicator */}
              <div className={cn(
                'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background',
                report.status === 'verified' ? 'bg-green-500' :
                report.status === 'under_review' ? 'bg-yellow-500' :
                report.status === 'resolved' ? 'bg-blue-500' : 'bg-red-500'
              )}>
                <span className="sr-only">
                  {report.status === 'verified' ? 'Verified' : 
                   report.status === 'under_review' ? 'Under Review' : 
                   report.status === 'resolved' ? 'Resolved' : 'Reported'}
                </span>
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none max-w-xs">
                <div className="font-semibold">{report.title}</div>
                <div className="text-muted-foreground text-[10px]">{report.location}</div>
                <div className="text-[10px] mt-1 line-clamp-2">{report.description}</div>
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
