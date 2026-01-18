import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  accessToken: any;
  id: string;
  name: string;
  email: string;
  isCreator: boolean;
  avatarUrl?: string;
  subscriberCount?: number;
  revenue?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, isCreator: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const formatUser = (sbUser: SupabaseUser, accessToken: string): User => ({
    id: sbUser.id,
    email: sbUser.email!,
    name: sbUser.user_metadata?.name || "No Name",
    isCreator: sbUser.user_metadata?.isCreator || false,
    avatarUrl: sbUser.user_metadata?.avatarUrl || undefined,
    subscriberCount: sbUser.user_metadata?.subscriberCount || 0,
    revenue: sbUser.user_metadata?.revenue || 0,
    accessToken: accessToken,

  });

  useEffect(() => {
    const updateUserToken = async (sessionUser: SupabaseUser, sessionAccessToken: string) => {
    await fetch("https://clonark.onrender.com/api/store-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.user_metadata?.name || "No Name",
        isCreator: sessionUser.user_metadata?.isCreator || false,
        avatarUrl: sessionUser.user_metadata?.avatarUrl || null,
        subscriberCount: sessionUser.user_metadata?.subscriberCount || 0,
        revenue: sessionUser.user_metadata?.revenue || 0,
        accessToken: sessionAccessToken,
      }),
    });
  }
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session?.user && session.access_token) {
      setUser(formatUser(session.user, session.access_token));
      await updateUserToken(session.user, session.access_token);
    }
    setLoading(false);
  }).catch((err) => {
  console.error("Error getting session:", err);
  setLoading(false);
});

  // Listen for auth state changes (login, logout, token refresh)
  const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user && session.access_token) {
      setUser(formatUser(session.user, session.access_token));
      await updateUserToken(session.user, session.access_token);
    } else {
      setUser(null);
    }
    setLoading(false);
  });
  
  return () => {
    listener.subscription.unsubscribe();
  };
}, []);

  const login = async (email: string, password: string): Promise<User> => {
  setLoading(true);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    setLoading(false);
    throw new Error(error.message);
  }

  const session = data.session;
  const sbUser = data.user;

  if (sbUser && session?.access_token) {
    const formattedUser = formatUser(sbUser, session.access_token);
    setUser(formattedUser);

    await fetch("https://clonark.onrender.com/api/store-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedUser),
    });

    setLoading(false);
    return formattedUser;
  }

  setLoading(false);
  throw new Error("No user found");
};


  const signup = async (email: string, password: string, name: string, isCreator: boolean) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          isCreator,
          subscriberCount: 0,
          revenue: 0,
        }
      }
    });

    if (error) {
      setLoading(false);
      throw new Error(error.message);
    }

    const sbUser = data.user;

    // In most cases, session will be null due to email confirmation
    const session = data.session;

    if (sbUser && session?.access_token) {
      const formattedUser = formatUser(sbUser, session.access_token);
      setUser(formattedUser);

      const response = await fetch("https://clonark.onrender.com/api/store-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sbUser.id,
          email: sbUser.email,
          name,
          isCreator,
          avatarUrl: null,
          subscriberCount: 0,
          revenue: 0,
          accessToken: session.access_token,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("Failed to store token (signup):", err);
      }
    } else {
      console.warn("Signup successful but session is null — likely due to email confirmation.");
    }

    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    
    // Clear all cookies from browser
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    setUser(null);
  };

  const value = { user, loading, login, logout, signup };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
