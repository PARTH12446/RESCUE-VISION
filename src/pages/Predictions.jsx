import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DisasterCard } from '@/components/dashboard/DisasterCard';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCw } from 'lucide-react';

const Predictions = () => {
  const { data, loading } = useRealtimeData();
  const [severityFilter, setSeverityFilter] = useState('all');

  const predictions = Array.isArray(data.predictions) ? data.predictions : [];
  const insights = data.insights;

  const filteredPredictions = severityFilter === 'all'
    ? predictions
    : predictions.filter(pred => pred.severity === severityFilter);

  if (loading) {
    return (
      <MainLayout title="Disaster Predictions" subtitle="AI-powered forecasting and risk assessment">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Disaster Predictions"
      subtitle="AI-powered forecasting and risk assessment"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <div className="flex gap-2">
            {['all', 'critical', 'high', 'medium', 'low'].map(severity => (
              <Button
                key={severity}
                variant={severity === severityFilter ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSeverityFilter(severity)}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPredictions.length > 0 ? (
          filteredPredictions.map(prediction => (
            <DisasterCard key={prediction.id} prediction={prediction} />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No predictions found for the selected filter.
          </div>
        )}
      </div>

      <div className="mt-8 glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">AI Analysis Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-sm text-muted-foreground">Highest Risk Region</p>
            <p className="text-xl font-bold text-foreground mt-1">{insights?.highestRiskRegion || 'Loading...'}</p>
            <p className="text-sm text-destructive mt-1">{insights?.highestRiskDescription || 'Analyzing...'}</p>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">Model Confidence</p>
            <p className="text-xl font-bold text-foreground mt-1">{insights?.modelConfidence?.toFixed(1) || '0'}%</p>
            <p className="text-sm text-primary mt-1">Based on {insights?.dataPoints?.toLocaleString() || '0'}+ data points</p>
          </div>
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <p className="text-sm text-muted-foreground">Early Warning</p>
            <p className="text-xl font-bold text-foreground mt-1">{insights?.earlyWarningHours || '0'} Hours</p>
            <p className="text-sm text-success mt-1">Average prediction lead time</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Predictions;