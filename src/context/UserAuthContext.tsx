"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  _id: string;
  email: string;
  username?: string;
  state?: string;
  city?: string;
  followedArtists?: string[];
  isVerified?: boolean;
  // Add other user fields as needed
}

interface UserAuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/user", { credentials: "include" });
      const data = await res.json();
      setUser(data.data || null);
    } catch {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const res = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });
    if (!res.ok) throw new Error("Login failed");
    await fetchUser();
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await fetch("/api/users/logout", { method: "GET", credentials: "include" });
    setUser(null);
    setLoading(false);
  };

  const refreshUser = fetchUser;

  return (
    <UserAuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used within a UserAuthProvider");
  return ctx;
};
