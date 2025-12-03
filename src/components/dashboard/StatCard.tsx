import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: 'primary' | 'destructive' | 'success' | 'warning' | 'accent';
}

const iconColorClasses = {
  primary: 'bg-primary/20 text-primary',
  destructive: 'bg-destructive/20 text-destructive',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  accent: 'bg-accent/20 text-accent',
};

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  iconColor = 'primary'
}: StatCardProps) {
  return (
    <div className="glass rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          {change && (
            <p className={cn(
              "text-sm mt-2 font-medium",
              changeType === 'positive' && "text-success",
              changeType === 'negative' && "text-destructive",
              changeType === 'neutral' && "text-muted-foreground"
            )}>
              {change}
            </p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl transition-transform group-hover:scale-110",
          iconColorClasses[iconColor]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
