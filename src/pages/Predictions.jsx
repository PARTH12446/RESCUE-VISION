import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DisasterCard } from '@/components/dashboard/DisasterCard';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCw } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import { fetchIndiaRisk } from '@/services/api';

const Predictions = () => {
  const { data, loading, error, refresh, lastUpdated } = useRealtimeData();
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [timeWindow, setTimeWindow] = useState('all');
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [indiaRisk, setIndiaRisk] = useState(null);
  const [indiaRiskLoading, setIndiaRiskLoading] = useState(false);
  const [indiaRiskError, setIndiaRiskError] = useState(null);

  const predictions = Array.isArray(data.predictions) ? data.predictions : [];
  const insights = data.insights;

  const regions = Array.from(new Set(predictions.map(pred => pred.location).filter(Boolean)));
  const types = Array.from(new Set(predictions.map(pred => pred.type).filter(Boolean)));

  const handleCheckIndiaRisk = () => {
    if (!navigator.geolocation) {
      setIndiaRiskError('Geolocation is not supported in this browser.');
      return;
    }
    setIndiaRiskLoading(true);
    setIndiaRiskError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
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
        setIndiaRiskError(err.message || 'Failed to fetch current location.');
        setIndiaRiskLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getAiReasoning = (prediction) => {
    if (!prediction) return 'AI analysis is not available for this prediction.';

    const probability = (prediction.probability || 0) * 100;
    const people = prediction.affectedPopulation || 0;
    const severity = prediction.severity || 'moderate';

    const parts = [];

    if (probability >= 80) {
      parts.push('The model detects a very high likelihood of this event based on recent patterns.');
    } else if (probability >= 50) {
      parts.push('The model sees a moderate-to-high chance of this event occurring.');
    } else {
      parts.push('The model currently estimates a lower probability, but conditions are being monitored.');
    }

    if (people >= 500000) {
      parts.push('A very large population is exposed, so even small changes in conditions could have a big impact.');
    } else if (people >= 100000) {
      parts.push('A significant number of people are within the affected zone.');
    } else if (people > 0) {
      parts.push('A localized population is affected in this area.');
    }

    if (severity === 'critical') {
      parts.push('Multiple high-risk signals (severity, population exposure, and trend velocity) all point to an elevated emergency level.');
    } else if (severity === 'high') {
      parts.push('Risk indicators are consistently above normal thresholds for this region.');
    }

    return parts.join(' ');
  };

  let filteredPredictions = predictions;

  if (severityFilter !== 'all') {
    filteredPredictions = filteredPredictions.filter(pred => pred.severity === severityFilter);
  }

  if (typeFilter !== 'all') {
    filteredPredictions = filteredPredictions.filter(pred => pred.type === typeFilter);
  }

  if (regionFilter !== 'all') {
    filteredPredictions = filteredPredictions.filter(pred => pred.location === regionFilter);
  }

  if (timeWindow !== 'all') {
    const now = new Date();
    filteredPredictions = filteredPredictions.filter(pred => {
      if (!pred.predictedTime) return false;
      const time = new Date(pred.predictedTime);
      const diffHours = (time - now) / (1000 * 60 * 60);
      if (diffHours < 0) return false;
      if (timeWindow === '24h') return diffHours <= 24;
      if (timeWindow === '3d') return diffHours <= 72;
      if (timeWindow === '7d') return diffHours <= 168;
      return true;
    });
  }

  const handleCardClick = (prediction) => {
    setSelectedPrediction(prediction);
    setDetailOpen(true);
  };

  if (loading && !data.predictions) {
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
      <div className="glass rounded-xl p-4 mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">My Risk in India</h3>
          <p className="text-xs text-muted-foreground">Use your current location to see a live India-specific hazard risk derived from real weather data.</p>
        </div>
        <div className="flex flex-col items-start gap-1 md:items-end">
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={handleCheckIndiaRisk}
            disabled={indiaRiskLoading}
          >
            {indiaRiskLoading ? 'Checking risk…' : 'Check my India risk'}
          </Button>
          {indiaRiskError && (
            <span className="text-xs text-destructive max-w-xs text-right">{indiaRiskError}</span>
          )}
          {indiaRisk && !indiaRiskLoading && (
            <div className="mt-1 text-xs text-right">
              <div className="text-foreground font-medium">{indiaRisk.location}</div>
              <div className="text-muted-foreground">{indiaRisk.type} · {indiaRisk.severity} · {(indiaRisk.probability * 100).toFixed(1)}% · {indiaRisk.riskScore.toFixed(1)}/10</div>
            </div>
          )}
        </div>
      </div>

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

        <div className="flex flex-wrap items-center gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map(type => (
                <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeWindow} onValueChange={setTimeWindow}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="Time Window" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Time</SelectItem>
              <SelectItem value="24h">Next 24 hours</SelectItem>
              <SelectItem value="3d">Next 3 days</SelectItem>
              <SelectItem value="7d">Next 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {lastUpdated && (
            <span>
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
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing' : 'Refresh'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
          Failed to load latest predictions: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPredictions.length > 0 ? (
          filteredPredictions.map(prediction => (
            <DisasterCard
              key={prediction.id}
              prediction={prediction}
              onClick={() => handleCardClick(prediction)}
            />
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedPrediction?.type ? selectedPrediction.type.charAt(0).toUpperCase() + selectedPrediction.type.slice(1) : 'Prediction Details'}
            </DialogTitle>
            <DialogDescription>
              Detailed AI prediction breakdown for {selectedPrediction?.location || 'the selected region'}.
            </DialogDescription>
          </DialogHeader>

          {selectedPrediction && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Region</p>
                  <p className="font-medium text-foreground">{selectedPrediction.location}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Severity</p>
                  <p className="font-medium text-foreground capitalize">{selectedPrediction.severity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Probability</p>
                  <p className="font-medium text-foreground">{(selectedPrediction.probability * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Risk Score</p>
                  <p className="font-medium text-foreground">{selectedPrediction.riskScore}/10</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Population at Risk</p>
                  <p className="font-medium text-foreground">{selectedPrediction.affectedPopulation?.toLocaleString()} people</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Predicted Time</p>
                  <p className="font-medium text-foreground">{selectedPrediction.predictedTime ? new Date(selectedPrediction.predictedTime).toLocaleString() : 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground">AI Reasoning</p>
                <p className="text-foreground leading-relaxed">
                  {selectedPrediction.aiExplanation ||
                    selectedPrediction.reasoning ||
                    getAiReasoning(selectedPrediction)}
                </p>
                <div className="mt-3 text-sm">
                  <p className="font-semibold text-foreground mb-1">AI Recommended Actions</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    {selectedPrediction.severity === 'critical' && (
                      <>
                        <li>Prepare immediate evacuation plans for the highest-risk zones.</li>
                        <li>Ensure emergency services and shelters are on standby.</li>
                      </>
                    )}
                    {selectedPrediction.severity === 'high' && (
                      <>
                        <li>Alert local authorities to pre-position resources.</li>
                        <li>Inform residents about potential risk and safety routes.</li>
                      </>
                    )}
                    {selectedPrediction.severity === 'moderate' && (
                      <>
                        <li>Monitor conditions closely for any rapid changes.</li>
                        <li>Review communication plans with local stakeholders.</li>
                      </>
                    )}
                    {selectedPrediction.severity === 'low' && (
                      <li>Continue routine monitoring; no immediate action required.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Predictions;