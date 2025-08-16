"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUserAuth } from "./UserAuthContext";

interface FollowedArtistsContextType {
  followedArtists: string[];
  loading: boolean;
  followArtist: (artist: string) => Promise<void>;
  unfollowArtist: (artist: string) => Promise<void>;
  refreshFollowedArtists: () => Promise<void>;
  isFollowing: (artist: string) => boolean;
}

const FollowedArtistsContext = createContext<FollowedArtistsContextType | undefined>(undefined);

export const FollowedArtistsProvider = ({ children }: { children: ReactNode }) => {
  const [followedArtists, setFollowedArtists] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUserAuth();

  const fetchFollowedArtists = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/user", { credentials: "include" });
      const data = await res.json();
      setFollowedArtists(data.data?.followedArtists || []);
    } catch {
      setFollowedArtists([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Reset followed artists when user changes (login/logout/signup)
    if (!user) {
      setFollowedArtists([]);
      setLoading(false);
      return;
    }
    fetchFollowedArtists();
  }, [user]);

  const followArtist = async (artist: string) => {
    const res = await fetch("/api/users/follow-artist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artist }),
      credentials: "include"
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to follow artist");
    setFollowedArtists(data.followedArtists);
  };

  const unfollowArtist = async (artist: string) => {
    const res = await fetch("/api/users/follow-artist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artist }),
      credentials: "include"
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to unfollow artist");
    setFollowedArtists(data.followedArtists);
  };

  const refreshFollowedArtists = fetchFollowedArtists;
  const isFollowing = (artist: string) => followedArtists.includes(artist);

  return (
    <FollowedArtistsContext.Provider value={{ followedArtists, loading, followArtist, unfollowArtist, refreshFollowedArtists, isFollowing }}>
      {children}
    </FollowedArtistsContext.Provider>
  );
};

export const useFollowedArtists = () => {
  const ctx = useContext(FollowedArtistsContext);
  if (!ctx) throw new Error("useFollowedArtists must be used within a FollowedArtistsProvider");
  return ctx;
};
