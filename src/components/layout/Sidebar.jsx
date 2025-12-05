import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Package,
  Map,
  Bell,
  Settings,
  Activity,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { useAuth } from '@/contexts/AuthProvider';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/predictions', icon: AlertTriangle, label: 'Predictions' },
  { path: '/resources', icon: Package, label: 'Resources' },
  { path: '/map', icon: Map, label: 'Live Map' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/insights', icon: Activity, label: 'AI Insights' },
  { path: '/analytics', icon: Activity, label: 'Analytics' },
  { path: '/reports', icon: AlertTriangle, label: 'Reports' },
];

export function Sidebar() {
  const location = useLocation();
  const { data } = useRealtimeData();
  const { user } = useAuth();

  // Get unread alert count from real-time data
  const unreadCount = data.alertStats?.unread || 0;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg tracking-tight">DisasterAI</h1>
            <p className="text-xs text-muted-foreground">Response System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems
            .filter((item) => {
              if (!user) return false;
              if (user.role === 'admin') return true;

              if (user.role === 'responder') {
                if (item.path === '/analytics') return false;
                return true;
              }

              if (user.role === 'civilian') {
                if (['/resources', '/map', '/analytics'].includes(item.path)) return false;
                return true;
              }

              return true;
            })
            .map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  "hover:bg-sidebar-accent group",
                  isActive && "bg-sidebar-accent border-l-2 border-primary"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span
                  className={cn(
                    "font-medium transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {item.label}
                </span>
                {item.label === 'Alerts' && unreadCount > 0 && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <NavLink
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </NavLink>
        </div>

        {/* Status */}
        <div className="px-4 py-4 mx-4 mb-4 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-success">System Online</span>
          </div>
          <p className="text-xs text-muted-foreground">AI Model v2.4.1</p>
          <p className="text-xs text-muted-foreground">Last sync: 2 min ago</p>
        </div>
      </div>
    </aside>
  );
}
