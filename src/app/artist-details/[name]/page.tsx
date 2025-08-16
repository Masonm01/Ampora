"use client";
import React, { useEffect, useState } from "react";
import { US_STATES, US_CITIES } from "../../helpers/usLocations";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const ArtistDetailsPage = () => {
  const { name } = useParams();
  const router = useRouter();
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  // Event filter state
  const [eventState, setEventState] = useState("");
  const [eventCity, setEventCity] = useState("");
  const [eventPage, setEventPage] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [eventTotalPages, setEventTotalPages] = useState(1);
  const [cityOptions, setCityOptions] = useState<string[]>([]);

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
    // Fetch events for this artist
    fetchEventsForArtist(artistName, eventState, eventCity, eventPage);
  }, [name, eventState, eventCity, eventPage]);

  // Update city options when state changes
  useEffect(() => {
    if (eventState && US_CITIES[eventState]) {
      setCityOptions(US_CITIES[eventState]);
    } else {
      setCityOptions([]);
    }
  }, [eventState]);

  const fetchEventsForArtist = (artistName: string, state: string, city: string, page: number) => {
    let url = `/api/ticketmaster?keyword=${encodeURIComponent(artistName)}&size=10&page=${page}`;
    if (state) url += `&state=${encodeURIComponent(state)}`;
    if (city) url += `&city=${encodeURIComponent(city)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const events = data._embedded?.events || [];
        // Sort events by soonest date
        const sortedEvents = events.slice().sort((a: any, b: any) => {
          const dateA = new Date(a.dates?.start?.dateTime || a.dates?.start?.localDate || 0).getTime();
          const dateB = new Date(b.dates?.start?.dateTime || b.dates?.start?.localDate || 0).getTime();
          return dateA - dateB;
        });
        setEvents(sortedEvents);
        setEventTotalPages(data.page?.totalPages || 1);
      });
  };

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
      {artist.images && artist.images.length > 0 ? (
        (() => {
          // Pick the largest image by width
          const bestImg = artist.images.reduce((prev: any, curr: any) => (curr.width > prev.width ? curr : prev), artist.images[0]);
          return <img src={bestImg.url} alt={decodeURIComponent(artist.name)} className="w-64 h-64 object-cover rounded-full mb-4" />;
        })()
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

      {/* Upcoming Events Section */}
      <div className="w-full max-w-2xl mt-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-800">Upcoming Events</h2>
        <form className="flex flex-wrap gap-2 mb-4 items-center">
          <label htmlFor="event-state">State:</label>
          <select
            id="event-state"
            value={eventState}
            onChange={e => { setEventState(e.target.value); setEventCity(""); setEventPage(0); }}
            className="border rounded px-2 py-1 text-gray-900 bg-white"
          >
            <option value="">All States</option>
            {US_STATES.map(state => (
              <option key={state.abbr} value={state.abbr}>{state.name}</option>
            ))}
          </select>
          <label htmlFor="event-city">City:</label>
          <select
            id="event-city"
            value={eventCity}
            onChange={e => { setEventCity(e.target.value); setEventPage(0); }}
            className="border rounded px-2 py-1 text-gray-900 bg-white"
            disabled={!eventState}
          >
            <option value="">{eventState ? "All Cities" : "Select a state first"}</option>
            {cityOptions.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </form>
        {events.length === 0 ? (
          <div className="text-gray-500 italic">No upcoming events found.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {events.map(event => (
              <li key={event.id} className="py-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="font-semibold text-lg">{event.name}</div>
                  <div className="text-gray-600">{event.dates?.start?.localDate} {event.dates?.start?.localTime && (<>@ {event.dates.start.localTime}</>)}</div>
                  <div className="text-gray-700">{event._embedded?.venues?.[0]?.name}, {event._embedded?.venues?.[0]?.city?.name}, {event._embedded?.venues?.[0]?.state?.name}</div>
                  {event.info && <div className="text-gray-500 text-sm mt-1">{event.info}</div>}
                  {event.url && <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">View Event</a>}
                </div>
                {event.images && event.images.length > 0 && (
                  <img
                    src={event.images.reduce((prev: any, curr: any) => (curr.width > prev.width ? curr : prev), event.images[0]).url}
                    alt={event.name}
                    className="w-32 h-20 object-cover rounded shadow"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
        {/* Pagination */}
        {eventTotalPages > 1 && (
          <div className="flex gap-2 justify-center mt-4">
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => setEventPage(p => Math.max(0, p - 1))}
              disabled={eventPage === 0}
            >
              Previous
            </button>
            <span className="px-2">Page {eventPage + 1} of {eventTotalPages}</span>
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => setEventPage(p => Math.min(eventTotalPages - 1, p + 1))}
              disabled={eventPage === eventTotalPages - 1}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistDetailsPage;
