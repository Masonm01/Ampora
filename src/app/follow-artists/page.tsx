"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

const FollowArtistsPage = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState<string[]>([]);

  // Search for artists using Ticketmaster API (or fallback to local if needed)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(`/api/ticketmaster?keyword=${encodeURIComponent(search)}&size=10&classificationName=music`);
      const data = await res.json();
      // Extract unique artist names from events
      const artists = new Set<string>();
      if (data._embedded?.events) {
        data._embedded.events.forEach((event: any) => {
          if (event._embedded?.attractions) {
            event._embedded.attractions.forEach((a: any) => artists.add(a.name));
          }
        });
      }
      // Always include the search term as an option
      artists.add(search.trim());
      setResults(Array.from(artists));
    } catch (err) {
      toast.error("Failed to search for artists");
    }
    setLoading(false);
  };

  // Follow artist (store in local state for now, can be persisted later)
  const handleFollow = (artist: string) => {
    if (!following.includes(artist)) {
      setFollowing([...following, artist]);
      toast.success(`Now following ${artist}`);
    } else {
      toast("Already following " + artist);
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
          <li key={artist} className="flex justify-between items-center border-b py-2">
            <span>{artist}</span>
            <button
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              onClick={() => handleFollow(artist)}
              disabled={following.includes(artist)}
            >
              {following.includes(artist) ? "Following" : "Follow"}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-8 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Artists You're Following</h2>
        <ul>
          {following.length === 0 && <li className="text-gray-500">You aren't following any artists yet.</li>}
          {following.map(artist => (
            <li key={artist} className="py-1">{artist}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FollowArtistsPage;
