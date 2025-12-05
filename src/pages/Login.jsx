import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-slate-950 to-slate-900 px-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-10 items-center">
        <div className="hidden md:flex flex-col gap-6 text-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide uppercase text-primary/80">Swift Response Grid</p>
              <h1 className="text-2xl font-bold tracking-tight mt-1">AI-Powered Disaster Command Center</h1>
            </div>
          </div>
          <p className="text-sm text-slate-300 max-w-md">
            Log into the operations console to monitor AI predictions, triage citizen reports, and coordinate field
            responders in real time.
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">Live risk scoring across regions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-slate-300">Real-time alert ingestion from citizens and sensors</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-slate-300">Resource allocation recommendations from the AI model</span>
            </div>
          </div>
        </div>

        <Card className="backdrop-blur-xl bg-slate-950/60 border-slate-800 shadow-2xl shadow-black/50">
          <CardHeader>
            <CardTitle className="text-xl text-slate-50">Sign in to Command Center</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Use one of the demo roles to explore different views:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                  admin@example.com
                </span>
                <span className="text-slate-400">Full access</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                  responder@example.com
                </span>
                <span className="text-slate-400">Field & alerts focus</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                  civilian@example.com
                </span>
                <span className="text-slate-400">Citizen reporting view</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-200">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-slate-50"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-200">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-slate-50"
                  autoComplete="current-password"
                  required
                />
                <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  Any password works in this demo – roles are decided by the email.
                </p>
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded px-2 py-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
