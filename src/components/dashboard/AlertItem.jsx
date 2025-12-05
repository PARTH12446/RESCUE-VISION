import { AlertTriangle, Info, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const severityIcons = {
  low: Info,
  moderate: AlertCircle,
  high: AlertTriangle,
  critical: XCircle,
};

const severityStyles = {
  low: 'border-l-success bg-success/5',
  moderate: 'border-l-warning bg-warning/5',
  high: 'border-l-primary bg-primary/5',
  critical: 'border-l-destructive bg-destructive/5',
};

export function AlertItem({ alert, isNew }) {
  const Icon = severityIcons[alert.severity];
  
  return (
    <div className={cn(
      "p-4 rounded-lg border-l-4 border border-border transition-all hover:scale-[1.01]",
      severityStyles[alert.severity],
      !alert.isRead && "ring-1 ring-primary/20",
      isNew && "animate-pulse shadow-lg shadow-primary/20"
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn(
          "w-5 h-5 mt-0.5 shrink-0",
          alert.severity === 'critical' && "text-destructive",
          alert.severity === 'high' && "text-primary",
          alert.severity === 'moderate' && "text-warning",
          alert.severity === 'low' && "text-success"
        )} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-foreground truncate">{alert.title}</h4>
            {!alert.isRead && (
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{alert.message}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>{alert.location}</span>
            <span>•</span>
            <span>{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
