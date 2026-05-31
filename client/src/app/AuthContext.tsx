"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from "react";
import axios from "axios";

type User = {
  _id: string;
  email: string;
  name: string;
  isPro: boolean;
  trialEndsAt: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
};

type AuthResponse = {
  token: string;
  user: User;
};

const AuthContext = createContext<AuthContextType | null>(null);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const TOKEN_STORAGE_KEY = "cr-token";
const TOKEN_CHANGE_EVENT = "cr-token-change";

function readStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function readServerToken() {
  return null;
}

function subscribeToTokenChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(TOKEN_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(TOKEN_CHANGE_EVENT, onStoreChange);
  };
}

function writeStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  window.dispatchEvent(new Event(TOKEN_CHANGE_EVENT));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const token = useSyncExternalStore(
    subscribeToTokenChanges,
    readStoredToken,
    readServerToken,
  );
  const loading = Boolean(token && !user);

  useEffect(() => {
    if (!token || user) {
      return;
    }

    let isCurrent = true;

    axios
      .get<User>(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (!isCurrent) return;
        setUser(res.data);
      })
      .catch(() => {
        if (!isCurrent) return;
        writeStoredToken(null);
        setUser(null);
      });

    return () => {
      isCurrent = false;
    };
  }, [token, user]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await axios.post<AuthResponse>(`${API}/auth/login`, {
      email,
      password,
    });
    setUser(res.data.user);
    writeStoredToken(res.data.token);
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const res = await axios.post<AuthResponse>(`${API}/auth/signup`, {
      email,
      password,
      name,
    });
    setUser(res.data.user);
    writeStoredToken(res.data.token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    writeStoredToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

export { API };
