import { MainLayout } from '@/components/layout/MainLayout';
import { ResourceBar } from '@/components/dashboard/ResourceBar';
import { mockResources } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Plus, Truck, Heart, Home, UtensilsCrossed, LifeBuoy } from 'lucide-react';
import { cn } from '@/lib/utils';

const resourceCategories = [
  { type: 'medical', icon: Heart, label: 'Medical', count: 2 },
  { type: 'food', icon: UtensilsCrossed, label: 'Food & Water', count: 1 },
  { type: 'shelter', icon: Home, label: 'Shelter', count: 1 },
  { type: 'rescue', icon: LifeBuoy, label: 'Rescue', count: 1 },
  { type: 'transport', icon: Truck, label: 'Transport', count: 1 },
];

const Resources = () => {
  return (
    <MainLayout 
      title="Resource Management" 
      subtitle="Track and allocate emergency resources"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {resourceCategories.map(category => (
          <div key={category.type} className="glass rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <category.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{category.label}</p>
                <p className="text-xs text-muted-foreground">{category.count} types</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">All Resources</h3>
        <Button className="gap-2 gradient-primary border-0">
          <Plus className="w-4 h-4" />
          Add Resource
        </Button>
      </div>

      {/* Resources List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {mockResources.map(resource => (
          <ResourceBar key={resource.id} resource={resource} />
        ))}
      </div>

      {/* Allocation Optimizer */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">AI Resource Optimizer</h3>
            <p className="text-sm text-muted-foreground mt-1">Automatically allocate resources based on predicted needs</p>
          </div>
          <Button variant="outline">Run Optimization</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">847</p>
            <p className="text-sm text-muted-foreground">Units deployed</p>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-sm text-muted-foreground">Active locations</p>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-2xl font-bold text-success">94%</p>
            <p className="text-sm text-muted-foreground">Efficiency score</p>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-2xl font-bold text-warning">3</p>
            <p className="text-sm text-muted-foreground">Pending transfers</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Resources;
