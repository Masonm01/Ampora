"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const FollowArtistsPage = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{ name: string, image?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState<string[]>([]);
  const router = useRouter();
  // Fetch followed artists from user data on mount
  useEffect(() => {
    fetch("/api/users/user")
      .then(res => res.json())
      .then(data => {
        setFollowing(data.data?.followedArtists || []);
      });
  }, []);

  // Search for artists using Ticketmaster API (or fallback to local if needed)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    setResults([]);
    try {
          const res = await fetch(`/api/ticketmaster/attraction/${encodeURIComponent(search)}`);
          const data = await res.json();
          // Extract artist names and images from attractions
          let artists: { name: string; image?: string }[] = [];
          if (data._embedded?.attractions) {
            artists = data._embedded.attractions.map((a: any) => ({
              name: a.name,
              image: a.images?.[0]?.url
            }));
          }
          setResults(artists);
    } catch (err) {
      toast.error("Failed to search for artists");
    }
    setLoading(false);
  };

  // Follow artist (persist to DB)
  const handleFollow = async (artist: string) => {
    if (following.includes(artist)) {
      toast("Already following " + artist);
      return;
    }
    try {
      const res = await fetch("/api/users/follow-artist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artist }),
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setFollowing(data.followedArtists);
        toast.success(`Now following ${artist}`);
      } else {
        toast.error(data.error || "Failed to follow artist");
      }
    } catch {
      toast.error("Failed to follow artist");
    }
  };

  // Unfollow artist
  const handleUnfollow = async (artist: string) => {
    try {
      const res = await fetch("/api/users/follow-artist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artist }),
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setFollowing(data.followedArtists);
        toast.success(`Unfollowed ${artist}`);
      } else {
        toast.error(data.error || "Failed to unfollow artist");
      }
    } catch {
      toast.error("Failed to unfollow artist");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 text-gray-900">
      <h1 className="text-3xl font-bold mb-4">Follow Artists</h1>
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search for an artist..."
          className="border rounded px-2 py-1 text-gray-900"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      <ul className="w-full max-w-md">
        {results.map(artist => (
          <li key={artist.name} className="flex justify-between items-center border-b py-2 gap-2">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(`/artist-details/${encodeURIComponent(artist.name)}`)}>
              {artist.image ? (
                <img src={artist.image} alt={decodeURIComponent(artist.name)} className="w-10 h-10 object-cover rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs">No Image</div>
              )}
              <span className="hover:underline">{decodeURIComponent(artist.name)}</span>
            </div>
            {following.includes(artist.name) ? (
              <button
                className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-600"
                onClick={() => handleUnfollow(artist.name)}
              >
                Unfollow
              </button>
            ) : (
              <button
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                onClick={() => handleFollow(artist.name)}
              >
                Follow
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-8 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Artists You're Following</h2>
        <ul>
          {following.length === 0 && <li className="text-gray-500">You aren't following any artists yet.</li>}
          {following.map(artist => (
            <li key={artist} className="py-1 flex justify-between items-center">
              <span className="cursor-pointer hover:underline" onClick={() => router.push(`/artist-details/${encodeURIComponent(artist)}`)}>{artist}</span>
              <button
                className="ml-2 text-xs text-red-600 hover:underline"
                onClick={() => handleUnfollow(artist)}
              >Remove</button>
            </li>
          ))}
        </ul>
      </div>
      <button
        className="mt-8 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-600"
        onClick={() => window.location.href = '/profile'}
      >
        Back to Profile
      </button>
    </div>
  );
};

export default FollowArtistsPage;
