import { 
  CloudRain, 
  Flame, 
  Mountain, 
  Wind, 
  Waves,
  MapPin,
  Users,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const disasterIcons = {
  earthquake: Mountain,
  flood: CloudRain,
  hurricane: Wind,
  wildfire: Flame,
  tsunami: Waves,
};

const severityColors = {
  low: 'bg-success/20 text-success border-success/30',
  moderate: 'bg-warning/20 text-warning border-warning/30',
  high: 'bg-primary/20 text-primary border-primary/30',
  critical: 'bg-destructive/20 text-destructive border-destructive/30',
};

const severityGlow = {
  low: '',
  moderate: '',
  high: 'glow-primary',
  critical: 'glow-danger animate-pulse-slow',
};

export function DisasterCard({ prediction, onClick }) {
  const Icon = disasterIcons[prediction.type];
  
  return (
    <div
      className={cn(
        "glass rounded-xl p-4 hover:border-primary/50 transition-all duration-300 cursor-pointer",
        severityGlow[prediction.severity]
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-lg border",
            severityColors[prediction.severity]
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground capitalize">{prediction.type}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {prediction.location}
            </div>
          </div>
        </div>
        <span className={cn(
          "px-2.5 py-1 rounded-full text-xs font-semibold uppercase border",
          severityColors[prediction.severity]
        )}>
          {prediction.severity}
        </span>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Probability</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full gradient-danger rounded-full transition-all duration-500"
                style={{ width: `${prediction.probability * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-foreground">
              {(prediction.probability * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Risk Score</span>
          <span className="text-xs font-semibold text-foreground">{prediction.riskScore}/10</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{(prediction.affectedPopulation / 1000).toFixed(0)}K at risk</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{format(prediction.predictedTime, 'MMM d, h:mm a')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
