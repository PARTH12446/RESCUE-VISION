import { MainLayout } from '@/components/layout/MainLayout';
import { useRealtimeData } from '@/hooks/useRealtimeData';

export default function Insights() {
  const { data, loading, error } = useRealtimeData();
  const insights = data.insights;

  return (
    <MainLayout
      title="AI Insights"
      subtitle="Model-driven risk assessment and recommendations"
    >
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load AI insights. {error}
        </div>
      )}

      {!loading && !error && insights && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">HIGHEST RISK REGION</p>
              <p className="text-lg font-semibold text-foreground">{insights.highestRiskRegion}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">MODEL CONFIDENCE</p>
              <p className="text-lg font-semibold text-foreground">{Math.round(insights.modelConfidence)}%</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">EARLY WARNING WINDOW</p>
              <p className="text-lg font-semibold text-foreground">{insights.earlyWarningHours} hrs</p>
            </div>
          </div>

          <div className="glass rounded-xl p-6 space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">RISK SUMMARY</p>
            <p className="text-base text-foreground">{insights.highestRiskDescription}</p>
          </div>

          {Array.isArray(insights.recommendations) && insights.recommendations.length > 0 && (
            <div className="glass rounded-xl p-6">
              <p className="text-sm font-semibold text-muted-foreground mb-3">
                Recommended actions
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
                {insights.recommendations.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!loading && !error && !insights && (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          AI insights are not available at the moment.
        </div>
      )}
    </MainLayout>
  );
}
