import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DisasterMap } from '@/components/map/DisasterMap';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { ReportDisasterModal } from '@/components/modals/ReportDisasterModal';
import { Button } from '@/components/ui/button';
import { Layers, ZoomIn, ZoomOut, Maximize2, PlusCircle } from 'lucide-react';

const MapView = () => {
  const { data, loading } = useRealtimeData();

  const [showReported, setShowReported] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  const predictions = Array.isArray(data.predictions) ? data.predictions : [];

  const reportedDisasters = data.reportedDisasters || [];

  if (loading) {
    return (
      <MainLayout title="Live Threat Map" subtitle="Geographic visualization of disaster risks">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <MainLayout
        title="Live Threat Map"
        subtitle="Geographic visualization of disaster risks"
        actions={
          <Button
            onClick={() => setShowReportModal(true)}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Report Disaster
          </Button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="relative">
              <DisasterMap
                predictions={predictions}
                reportedDisasters={showReported ? reportedDisasters : []}
              />

              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button variant="secondary" size="icon" className="bg-card/90 backdrop-blur">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="icon" className="bg-card/90 backdrop-blur">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="icon" className="bg-card/90 backdrop-blur">
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant={showReported ? 'default' : 'secondary'}
                  size="icon"
                  className="bg-card/90 backdrop-blur"
                  onClick={() => setShowReported(!showReported)}
                  title={showReported ? 'Hide reported incidents' : 'Show reported incidents'}
                >
                  <Layers className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-foreground">Active Threats</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setShowReportModal(true)}
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1" />
                  Report
                </Button>
              </div>
              <div className="space-y-3">
                {predictions.slice(0, 4).map(prediction => (
                  <div
                    key={prediction.id}
                    className="p-3 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground capitalize">{prediction.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${prediction.severity === 'critical' ? 'bg-destructive/20 text-destructive' :
                          prediction.severity === 'high' ? 'bg-primary/20 text-primary' :
                            'bg-warning/20 text-warning'
                        }`}>
                        {prediction.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{prediction.location}</p>
                    <p className="text-xs text-primary mt-1">{((prediction.probability || 0) * 100).toFixed(0)}% probability</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3">Map Layers</h3>
              <div className="space-y-2">
                {['Disaster Zones', 'Evacuation Routes', 'Resource Depots', 'Response Teams', 'Population Density'].map(layer => (
                  <label key={layer} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-border" />
                    <span className="text-sm text-muted-foreground">{layer}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>

      <ReportDisasterModal open={showReportModal} onOpenChange={setShowReportModal} />
    </>
  );
};

export default MapView;