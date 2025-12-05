import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'disaster-ai-auth';

const MOCK_USERS = {
  'admin@example.com': { role: 'admin', name: 'Admin Operator' },
  'responder@example.com': { role: 'responder', name: 'Field Responder' },
  'civilian@example.com': { role: 'civilian', name: 'Civilian Reporter' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email && parsed.role) {
        setUser(parsed);
      }
    } catch (e) {
      console.error('Failed to load auth state', e);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  const login = async (email, password) => {
    const normalizedEmail = String(email || '').toLowerCase();
    const mock = MOCK_USERS[normalizedEmail];

    if (!mock) {
      throw new Error('Invalid credentials');
    }

    const nextUser = {
      email: normalizedEmail,
      role: mock.role,
      name: mock.name,
    };

    setUser(nextUser);
    return nextUser;
  };

  const logout = () => {
    setUser(null);
  };

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
