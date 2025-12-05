import { Bell, Search, User, ChevronDown, LogOut, Settings, User as UserIcon, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { search } from '@/services/api';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeProvider';
import { useAuth } from '@/contexts/AuthProvider';

export function Header({ title, subtitle, actions }) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { data } = useRealtimeData();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);

  // Get unread alert count from real-time data
  const unreadCount = data.alertStats?.unread || 0;

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults(null);
        setShowResults(false);
        return;
      }

      setSearching(true);
      try {
        const results = await search(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        {actions && (
          <div className="ml-auto flex items-center gap-2">
            {actions}
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search disasters, resources..."
              className="w-64 pl-10 bg-secondary border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
            />

            {/* Search Results Dropdown */}
            {showResults && searchResults && searchResults.total > 0 && (
              <div className="absolute top-full mt-2 w-96 bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {searchResults.predictions?.length > 0 && (
                  <div className="p-3 border-b border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">PREDICTIONS</p>
                    {searchResults.predictions.map((pred) => (
                      <div key={pred.id} className="p-2 hover:bg-accent rounded cursor-pointer mb-1">
                        <p className="text-sm font-medium capitalize">{pred.type}</p>
                        <p className="text-xs text-muted-foreground">{pred.location}</p>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.alerts?.length > 0 && (
                  <div className="p-3 border-b border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">ALERTS</p>
                    {searchResults.alerts.map((alert) => (
                      <div key={alert.id} className="p-2 hover:bg-accent rounded cursor-pointer mb-1">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.location}</p>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.resources?.length > 0 && (
                  <div className="p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">RESOURCES</p>
                    {searchResults.resources.map((resource) => (
                      <div key={resource.id} className="p-2 hover:bg-accent rounded cursor-pointer mb-1">
                        <p className="text-sm font-medium">{resource.name}</p>
                        <p className="text-xs text-muted-foreground">{resource.location}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate('/alerts')}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-full px-2 hover:bg-accent">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground text-left">
                      {user?.name || 'Operator'}
                    </p>
                    <p className="text-xs text-muted-foreground text-left">
                      {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Role'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'Operator'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'Signed in'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
                  <DropdownMenuRadioItem
                    value="light"
                    className="cursor-pointer flex items-center"
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="dark"
                    className="cursor-pointer flex items-center"
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="system"
                    className="cursor-pointer flex items-center"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleProfileClick}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleSettingsClick}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
