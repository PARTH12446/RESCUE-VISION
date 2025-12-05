import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { fetchReportedDisasters, fetchIndiaRisk } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const severityColors = {
  low: 'bg-emerald-500/10 text-emerald-500',
  medium: 'bg-amber-500/10 text-amber-500',
  high: 'bg-red-500/10 text-red-500',
  critical: 'bg-red-600/10 text-red-600',
};

const statusColors = {
  reported: 'bg-slate-500/10 text-slate-400',
  verified: 'bg-blue-500/10 text-blue-400',
  resolved: 'bg-emerald-500/10 text-emerald-400',
};

export default function ReportedDisasters() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [indiaRisk, setIndiaRisk] = useState(null);
  const [indiaRiskLoading, setIndiaRiskLoading] = useState(false);
  const [indiaRiskError, setIndiaRiskError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadReports() {
      try {
        setLoading(true);
        const data = await fetchReportedDisasters();
        if (mounted) {
          setReports(Array.isArray(data) ? data : data?.data || []);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load reported disasters');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      mounted = false;
    };
  }, []);

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

  const filteredReports = reports.filter((report) => {
    const severityMatch = severityFilter === 'all' || (report.severity || '').toLowerCase() === severityFilter;
    const statusMatch = statusFilter === 'all' || (report.status || '').toLowerCase() === statusFilter;
    return severityMatch && statusMatch;
  });

  return (
    <MainLayout
      title="Reported Disasters"
      subtitle="Citizen and field reports flowing into the command center"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              View and triage incoming disaster reports from civilians, responders, and sensors.
            </p>
          </div>
          <div className="glass rounded-xl p-4 md:w-96">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">My India Risk</p>
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted/40 transition-colors"
                  onClick={handleCheckIndiaRisk}
                  disabled={indiaRiskLoading}
                >
                  {indiaRiskLoading ? 'Checking…' : 'Check'}
                </button>
              </div>
              {indiaRiskError && (
                <p className="text-xs text-destructive">{indiaRiskError}</p>
              )}
              {indiaRisk && !indiaRiskLoading && (
                <div className="text-xs space-y-1">
                  <p className="text-foreground font-medium">{indiaRisk.location}</p>
                  <p className="text-muted-foreground capitalize">
                    {indiaRisk.type} · {indiaRisk.severity}
                  </p>
                  <p className="text-muted-foreground">
                    {(indiaRisk.probability * 100).toFixed(1)}% · {indiaRisk.riskScore.toFixed(1)}/10
                  </p>
                </div>
              )}
              {!indiaRisk && !indiaRiskLoading && !indiaRiskError && (
                <p className="text-xs text-muted-foreground">
                  Use India risk context to prioritize which reports to verify first.
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading reported disasters...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">
            No reports match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Severity</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Reported At</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => {
                  const severityKey = (report.severity || '').toLowerCase();
                  const statusKey = (report.status || '').toLowerCase();

                  return (
                    <tr
                      key={report.id || report._id || `${report.title}-${report.timestamp}`}
                      className="border-t border-border/60 hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-foreground max-w-xs truncate">
                        {report.title || 'Untitled report'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {report.type || 'Unknown'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={severityColors[severityKey] || 'bg-slate-500/10 text-slate-400'}
                        >
                          {report.severity || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={statusColors[statusKey] || 'bg-slate-500/10 text-slate-400'}
                        >
                          {(report.status || 'reported').toString().charAt(0).toUpperCase() + (report.status || 'reported').toString().slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                        {typeof report.location === 'string'
                          ? report.location
                          : report.location?.description ||
                            [report.location?.city, report.location?.country].filter(Boolean).join(', ') ||
                            'N/A'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {report.timestamp
                          ? new Date(report.timestamp).toLocaleString()
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
