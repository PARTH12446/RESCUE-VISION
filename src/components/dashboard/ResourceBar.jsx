import {
  Heart,
  UtensilsCrossed,
  Home,
  LifeBuoy,
  Truck,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const resourceIcons = {
  medical: Heart,
  food: UtensilsCrossed,
  shelter: Home,
  rescue: LifeBuoy,
  transport: Truck,
};

const statusColors = {
  available: 'text-success',
  deployed: 'text-warning',
  'in-transit': 'text-accent',
  'maintenance': 'text-muted-foreground',
};

export function ResourceBar({ resource, onDelete }) {
  const Icon = resourceIcons[resource.type];
  const percentage = (resource.available / resource.quantity) * 100;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${resource.name}"?`)) {
      onDelete?.(resource.id);
    }
  };

  return (
    <div className="glass rounded-lg p-4 hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-foreground text-sm">{resource.name}</h4>
            <p className="text-xs text-muted-foreground">{resource.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-medium capitalize", statusColors[resource.status])}>
            {resource.status}
          </span>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Available</span>
          <span className="text-foreground font-medium">
            {resource.available.toLocaleString()} / {resource.quantity.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              percentage > 60 ? "gradient-safe" : percentage > 30 ? "gradient-primary" : "gradient-danger"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
