
"use client";
import Image from 'next/image';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useFollowedArtists } from '../../context/FollowedArtistsContext';

const FollowArtistsPage = () => {
  const [search, setSearch] = useState("");

const FollowArtistsPage = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{ name: string, image?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const { followedArtists, followArtist, unfollowArtist, isFollowing } = useFollowedArtists();
  const router = useRouter();
  // Fetch followed artists from user data on mount
  

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
          interface Attraction {
            name: string;
            images?: { url: string }[];
          }
          let artists: { name: string; image?: string }[] = [];
          if (data._embedded?.attractions) {
            artists = data._embedded.attractions.map((a: Attraction) => ({
              name: a.name,
              image: a.images?.[0]?.url
            }));
          }
          setResults(artists);
    } catch {
      toast.error("Failed to search for artists");
    }
    setLoading(false);
  };

  // Follow artist (persist to DB)
  const handleFollow = async (artist: string) => {
    if (isFollowing(artist)) {
      toast("Already following " + artist);
      return;
    }
    try {
      await followArtist(artist);
      toast.success(`Now following ${artist}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to follow artist";
      toast.error(message);
    }
  };

  // Unfollow artist
  const handleUnfollow = async (artist: string) => {
    try {
      await unfollowArtist(artist);
      toast.success(`Unfollowed ${artist}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to unfollow artist";
      toast.error(message);
    }
  };

  return (
  <div className="flex flex-col items-center justify-center min-h-screen py-2" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
  <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--secondary)' }}>Follow Artists</h1>
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search for an artist..."
          className="border rounded px-2 py-1"
          style={{ color: 'var(--foreground)', background: 'var(--accent)', borderColor: 'var(--secondary)' }}
        />
        <button
          type="submit"
          className="px-4 py-1 rounded"
          style={{ background: 'var(--secondary)', color: 'white' }}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      <ul className="w-full max-w-md">
        {results.map(artist => (
          <li key={artist.name} className="flex justify-between items-center border-b py-2 gap-2" style={{ borderColor: 'var(--secondary)' }}>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(`/artist-details/${encodeURIComponent(artist.name)}`)}>
              {artist.image ? (
                <Image src={artist.image} alt={decodeURIComponent(artist.name)} width={40} height={40} className="w-10 h-10 object-cover rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs">No Image</div>
              )}
              <span className="hover:underline">{decodeURIComponent(artist.name)}</span>
            </div>
            {isFollowing(artist.name) ? (
              <button
                className="px-3 py-1 rounded"
                style={{ background: 'var(--accent)', color: 'white' }}
                onClick={() => handleUnfollow(artist.name)}
              >
                Unfollow
              </button>
            ) : (
              <button
                className="px-3 py-1 rounded"
                style={{ background: 'var(--secondary)', color: 'white' }}
                onClick={() => handleFollow(artist.name)}
              >
                Follow
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-8 w-full max-w-md" style={{ background: 'var(--accent)', borderRadius: '0.5rem', padding: '1rem' }}>
  <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--secondary)' }}>Artists You&apos;re Following</h2>
        <ul>
          {followedArtists.length === 0 && <li style={{ color: 'var(--foreground)', opacity: 0.7 }}>You aren&apos;t following any artists yet.</li>}
          {followedArtists.map((artist: string) => (
            <li key={artist} className="py-1 flex justify-between items-center">
              <span className="cursor-pointer hover:underline" style={{ color: 'var(--foreground)' }} onClick={() => router.push(`/artist-details/${encodeURIComponent(artist)}`)}>{artist}</span>
              <button
                className="ml-2 text-xs hover:underline"
                style={{ color: 'var(--secondary)' }}
                onClick={() => handleUnfollow(artist)}
              >Remove</button>
            </li>
          ))}
        </ul>
      </div>
      <button
        className="mt-8 px-4 py-2 rounded"
        style={{ background: 'var(--secondary)', color: 'white' }}
        onClick={() => window.location.href = '/profile'}
      >
        Back to Profile
      </button>
    </div>
  );
};

}

export default FollowArtistsPage;
