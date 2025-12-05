import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DisasterMap } from '@/components/map/DisasterMap';
import { GoogleMapEmbed } from '@/components/map/GoogleMapEmbed';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { ReportDisasterModal } from '@/components/modals/ReportDisasterModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layers, ZoomIn, ZoomOut, Maximize2, PlusCircle, RefreshCw, MapPin } from 'lucide-react';
import { fetchIndiaRisk } from '@/services/api';

const MapView = () => {
  const { data, loading, error, refresh, lastUpdated } = useRealtimeData();

  const [showReported, setShowReported] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState('World');
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [indiaRisk, setIndiaRisk] = useState(null);
  const [indiaRiskLoading, setIndiaRiskLoading] = useState(false);
  const [indiaRiskError, setIndiaRiskError] = useState(null);

  const predictions = Array.isArray(data.predictions) ? data.predictions : [];

  const reportedDisasters = data.reportedDisasters || [];

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported in this browser.');
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter(`${latitude},${longitude}`);
        setLocating(false);
        setIndiaRiskError(null);
        setIndiaRiskLoading(true);
        fetchIndiaRisk({ lat: latitude, lon: longitude })
          .then((risk) => {
            setIndiaRisk(risk);
          })
          .catch((err) => {
            setIndiaRiskError(err instanceof Error ? err.message : 'Failed to fetch India risk');
          })
          .finally(() => {
            setIndiaRiskLoading(false);
          });
      },
      (err) => {
        setLocationError(err.message || 'Failed to fetch current location.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setMapCenter(searchQuery.trim());
  };

  if (loading && !predictions.length) {
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
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground mr-2">
                Last update: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing' : 'Refresh'}
            </Button>
            <Button
              onClick={() => setShowReportModal(true)}
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Report Disaster
            </Button>
          </div>
        }
      >
        {error && (
          <div className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
            Failed to load latest map data: {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_3fr] gap-6">
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
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedPrediction?.id === prediction.id ? 'bg-primary/10 border border-primary/40' : 'bg-secondary/50 hover:bg-secondary'}`}
                    onClick={() => setSelectedPrediction(prediction)}
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

            <div className="glass rounded-xl p-4 space-y-2">
              <h3 className="font-semibold text-foreground">My Risk in India</h3>
              {indiaRiskLoading && (
                <p className="text-xs text-muted-foreground">Calculating risk from live weather data…</p>
              )}
              {indiaRiskError && (
                <p className="text-xs text-destructive">{indiaRiskError}</p>
              )}
              {indiaRisk && !indiaRiskLoading && (
                <div className="text-xs space-y-1">
                  <p className="text-muted-foreground">Location</p>
                  <p className="text-foreground font-medium">{indiaRisk.location}</p>
                  <p className="text-muted-foreground mt-2">Hazard Type</p>
                  <p className="text-foreground capitalize">{indiaRisk.type}</p>
                  <p className="text-muted-foreground mt-2">Severity</p>
                  <p className="text-foreground capitalize">{indiaRisk.severity}</p>
                  <p className="text-muted-foreground mt-2">Probability</p>
                  <p className="text-foreground">{(indiaRisk.probability * 100).toFixed(1)}%</p>
                  <p className="text-muted-foreground mt-2">Risk Score</p>
                  <p className="text-foreground">{indiaRisk.riskScore.toFixed(1)}/10</p>
                  <p className="text-muted-foreground mt-2">Predicted Time</p>
                  <p className="text-foreground">{indiaRisk.predictedTime ? new Date(indiaRisk.predictedTime).toLocaleString() : 'N/A'}</p>
                </div>
              )}
              {!indiaRisk && !indiaRiskLoading && !indiaRiskError && (
                <p className="text-xs text-muted-foreground">Use your location to see personalized India risk.</p>
              )}
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

            <div className="glass rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-foreground">Location Tools</h3>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search location (city, region)"
                  className="h-8 text-sm"
                />
                <Button type="submit" size="sm" className="gap-1 h-8">
                  <MapPin className="w-3.5 h-3.5" />
                  Go
                </Button>
              </form>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 w-full"
                onClick={handleUseMyLocation}
                disabled={locating}
              >
                <MapPin className={`w-3.5 h-3.5 ${locating ? 'animate-pulse' : ''}`} />
                {locating ? 'Fetching your location…' : 'Use my location'}
              </Button>

              {locationError && (
                <p className="text-xs text-destructive mt-1">{locationError}</p>
              )}

              <GoogleMapEmbed center={mapCenter} zoom={6} />
            </div>
          </div>

          <div>
            <div className="relative">
              <DisasterMap
                predictions={predictions}
                reportedDisasters={showReported ? reportedDisasters : []}
                selectedPredictionId={selectedPrediction?.id}
                onPredictionClick={setSelectedPrediction}
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
        </div>
      </MainLayout>

      <ReportDisasterModal open={showReportModal} onOpenChange={setShowReportModal} />
    </>
  );
};

export default MapView;