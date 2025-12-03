import { Resource, ResourceType } from '@/types/disaster';
import { 
  Heart, 
  UtensilsCrossed, 
  Home, 
  LifeBuoy, 
  Truck 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const resourceIcons: Record<ResourceType, typeof Heart> = {
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
};

interface ResourceBarProps {
  resource: Resource;
}

export function ResourceBar({ resource }: ResourceBarProps) {
  const Icon = resourceIcons[resource.type];
  const percentage = (resource.available / resource.quantity) * 100;
  
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
        <span className={cn("text-xs font-medium capitalize", statusColors[resource.status])}>
          {resource.status}
        </span>
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
