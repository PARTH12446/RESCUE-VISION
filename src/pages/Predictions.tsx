import { MainLayout } from '@/components/layout/MainLayout';
import { DisasterCard } from '@/components/dashboard/DisasterCard';
import { mockPredictions } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCw } from 'lucide-react';

const Predictions = () => {
  return (
    <MainLayout 
      title="Disaster Predictions" 
      subtitle="AI-powered forecasting and risk assessment"
    >
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <div className="flex gap-2">
            {['All', 'Critical', 'High', 'Moderate', 'Low'].map(filter => (
              <Button 
                key={filter} 
                variant={filter === 'All' ? 'default' : 'ghost'} 
                size="sm"
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPredictions.map(prediction => (
          <DisasterCard key={prediction.id} prediction={prediction} />
        ))}
      </div>

      {/* AI Insights */}
      <div className="mt-8 glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">AI Analysis Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-sm text-muted-foreground">Highest Risk Region</p>
            <p className="text-xl font-bold text-foreground mt-1">Miami, FL</p>
            <p className="text-sm text-destructive mt-1">Flash flood warning active</p>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">Model Confidence</p>
            <p className="text-xl font-bold text-foreground mt-1">94.7%</p>
            <p className="text-sm text-primary mt-1">Based on 10,000+ data points</p>
          </div>
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <p className="text-sm text-muted-foreground">Early Warning</p>
            <p className="text-xl font-bold text-foreground mt-1">72 Hours</p>
            <p className="text-sm text-success mt-1">Average prediction lead time</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Predictions;
