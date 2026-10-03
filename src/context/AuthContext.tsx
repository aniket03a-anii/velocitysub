import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { DataService } from '../services/dataService';
import { DEMO_USER_PROFILE } from '../services/demoData';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemoUser: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => void;
  refreshPersona: () => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'submate_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    // Check local session or Supabase session
    const initAuth = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            setUser({
              id: data.session.user.id,
              user_id: data.session.user.id,
              full_name: data.session.user.user_metadata?.full_name || 'Subscriber',
              email: data.session.user.email || '',
              currency: 'INR',
              timezone: 'Asia/Kolkata',
              created_at: data.session.user.created_at
            });
            setIsDemoUser(false);
            setLoading(false);
            return;
          }
        }

        // Fallback to local stored session
        const storedUser = localStorage.getItem(AUTH_USER_KEY);
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setIsDemoUser(parsed.email === DEMO_USER_PROFILE.email);
        } else {
          // Auto-load demo user for seamless hackathon review
          setUser(DEMO_USER_PROFILE);
          setIsDemoUser(true);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(DEMO_USER_PROFILE));
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || 'SubMateHackathon2026!'
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        const uProfile: UserProfile = {
          id: data.user.id,
          user_id: data.user.id,
          full_name: data.user.user_metadata?.full_name || email.split('@')[0],
          email: data.user.email || email,
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          created_at: data.user.created_at
        };
        setUser(uProfile);
        setIsDemoUser(false);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(uProfile));
        return { success: true };
      }
    }

    // Local authentication
    const uProfile: UserProfile = {
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      user_id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      full_name: email.split('@')[0].replace('.', ' '),
      email,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      created_at: new Date().toISOString()
    };
    setUser(uProfile);
    setIsDemoUser(email === DEMO_USER_PROFILE.email);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(uProfile));
    // Generate fresh, distinct data seeded by this specific user & login timestamp
    DataService.loadPersonalizedData(
      uProfile.user_id,
      uProfile.email,
      uProfile.full_name,
      Date.now()
    );
    return { success: true };
  };

  const register = async (name: string, email: string, password?: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || 'SubMateHackathon2026!',
        options: {
          data: { full_name: name }
        }
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        const uProfile: UserProfile = {
          id: data.user.id,
          user_id: data.user.id,
          full_name: name,
          email,
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          created_at: data.user.created_at
        };
        setUser(uProfile);
        setIsDemoUser(false);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(uProfile));
        DataService.loadPersonalizedData(uProfile.user_id, uProfile.email, uProfile.full_name, Date.now());
        return { success: true };
      }
    }

    const uProfile: UserProfile = {
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      user_id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      full_name: name,
      email,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      created_at: new Date().toISOString()
    };
    setUser(uProfile);
    setIsDemoUser(false);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(uProfile));
    DataService.loadPersonalizedData(uProfile.user_id, uProfile.email, uProfile.full_name, Date.now());
    return { success: true };
  };

  const loginAsDemo = () => {
    // Randomize demo seed on every click so demo login always produces unique data!
    const seed = Date.now();
    const demoNames = ['Aniket Sharma', 'Rohan Mehta', 'Priya Kapoor', 'Aditya Verma', 'Sneha Patel'];
    const demoEmails = ['aniket03a@gmail.com', 'rohan.tech@gmail.com', 'priya.design@gmail.com', 'aditya.v@gmail.com', 'sneha.growth@gmail.com'];
    const idx = Math.floor(Math.random() * demoNames.length);

    const uProfile: UserProfile = {
      id: `usr_demo_${Math.floor(100000 + Math.random() * 900000)}`,
      user_id: `usr_demo_${Math.floor(100000 + Math.random() * 900000)}`,
      full_name: demoNames[idx],
      email: demoEmails[idx],
      avatar_url: '',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      created_at: new Date().toISOString()
    };

    setUser(uProfile);
    setIsDemoUser(true);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(uProfile));
    DataService.loadPersonalizedData(uProfile.user_id, uProfile.email, uProfile.full_name, seed);
  };

  const refreshPersona = () => {
    if (!user) return;
    const seed = Date.now();
    DataService.loadPersonalizedData(user.user_id, user.email, user.full_name, seed);
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsDemoUser(false);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { success: false, error: error.message };
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoUser,
        login,
        register,
        loginAsDemo,
        refreshPersona,
        logout,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
