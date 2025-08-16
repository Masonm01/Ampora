"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const ArtistDetailsPage = () => {
  const { name } = useParams();
  const router = useRouter();
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (!name) return;
  const rawName = Array.isArray(name) ? name[0] : name;
  const artistName = rawName ? decodeURIComponent(rawName) : "";
    // Fetch artist info from Ticketmaster Attractions API
    fetch(`/api/ticketmaster/attraction/${encodeURIComponent(artistName)}`)
      .then(res => res.json())
      .then(data => {
        let found = null;
        if (data._embedded?.attractions?.[0]) {
          found = data._embedded.attractions[0];
        }
        setArtist(found || { name: artistName });
        setLoading(false);
      });
    // Check if following
    fetch("/api/users/user")
      .then(res => res.json())
      .then(data => {
        setFollowing((data.data?.followedArtists || []).includes(artistName));
      });
  }, [name]);

  const handleFollow = async () => {
  const rawName = Array.isArray(name) ? name[0] : name;
  const artistName = rawName ? decodeURIComponent(rawName) : "";
    try {
      const res = await fetch("/api/users/follow-artist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artist: artistName }),
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setFollowing(true);
        toast.success(`Now following ${artistName}`);
      } else {
        toast.error(data.error || "Failed to follow artist");
      }
    } catch {
      toast.error("Failed to follow artist");
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center min-h-screen py-2">Loading...</div>;
  if (!artist) return <div className="flex flex-col items-center justify-center min-h-screen py-2">Artist not found.</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 text-gray-900">
      <h1 className="text-4xl font-bold mb-4">{decodeURIComponent(artist.name)}</h1>
      {artist.images && artist.images[0] ? (
        <img src={artist.images[0].url} alt={decodeURIComponent(artist.name)} className="w-64 h-64 object-cover rounded-full mb-4" />
      ) : (
        <div className="w-64 h-64 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-2xl mb-4">No Image</div>
      )}
      {artist.externalLinks?.homepage && artist.externalLinks.homepage[0]?.url && (
        <a href={artist.externalLinks.homepage[0].url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mb-2">Official Website</a>
      )}
      {artist.info && <p className="mb-4 max-w-xl text-center">{artist.info}</p>}
      <button
        className={`px-6 py-2 rounded text-white mb-4 ${following ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
        onClick={handleFollow}
        disabled={following}
      >
        {following ? "Following" : "Follow"}
      </button>
      <button
        className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-600"
        onClick={() => router.back()}
      >
        Back
      </button>
    </div>
  );
};

export default ArtistDetailsPage;
