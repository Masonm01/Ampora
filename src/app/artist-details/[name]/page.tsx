"use client";
import React, { useEffect, useState } from "react";
import { useFollowedArtists } from '../../../context/FollowedArtistsContext';
import { US_STATES, US_CITIES } from "../../helpers/usLocations";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";


interface Artist {
  name: string;
  images?: { url: string; width: number }[];
  externalLinks?: { homepage?: { url: string }[] };
  info?: string;
}

interface Event {
  id: string;
  name: string;
  dates?: { start?: { localDate?: string; localTime?: string; dateTime?: string } };
  _embedded?: { venues?: { name?: string; city?: { name?: string }; state?: { name?: string } }[] };
  info?: string;
  url?: string;
  images?: { url: string; width: number }[];
}

const ArtistDetailsPage = () => {
  const { name } = useParams();
  const router = useRouter();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const { isFollowing, followArtist, unfollowArtist } = useFollowedArtists();
  // Event filter state
  const [eventState, setEventState] = useState("");
  const [eventCity, setEventCity] = useState("");
  const [eventPage, setEventPage] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
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
        const events: Event[] = data._embedded?.events || [];
        // Sort events by soonest date
        const sortedEvents = events.slice().sort((a: Event, b: Event) => {
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
      await followArtist(artistName);
      toast.success(`Now following ${artistName}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to follow artist";
      toast.error(message);
    }
  };

  const handleUnfollow = async () => {
    const rawName = Array.isArray(name) ? name[0] : name;
    const artistName = rawName ? decodeURIComponent(rawName) : "";
    try {
      await unfollowArtist(artistName);
      toast.success(`Unfollowed ${artistName}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to unfollow artist";
      toast.error(message);
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center min-h-screen py-2">Loading...</div>;
  if (!artist) return <div className="flex flex-col items-center justify-center min-h-screen py-2">Artist not found.</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--secondary)' }}>{decodeURIComponent(artist.name)}</h1>
      {artist.images && artist.images.length > 0 ? (
        (() => {
          // Pick the largest image by width
          const bestImg = artist.images.reduce((prev, curr) => (curr.width > prev.width ? curr : prev), artist.images[0]);
          return <img src={bestImg.url} alt={decodeURIComponent(artist.name)} className="w-64 h-64 object-cover rounded-full mb-4" />;
        })()
      ) : (
  <div className="w-64 h-64 rounded-full flex items-center justify-center text-2xl mb-4" style={{ background: 'var(--accent)', color: 'var(--secondary)' }}>No Image</div>
      )}
      {artist.externalLinks?.homepage && artist.externalLinks.homepage[0]?.url && (
        <a href={artist.externalLinks.homepage[0].url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'underline', marginBottom: '0.5rem', display: 'inline-block' }}>Official Website</a>
      )}
  {artist.info && <p className="mb-4 max-w-xl text-center" style={{ color: 'var(--foreground)' }}>{artist.info}</p>}
      {!isFollowing(artist?.name) && (
        <button
          className="px-6 py-2 rounded mb-4"
          style={{ background: 'var(--secondary)', color: 'white' }}
          onClick={handleFollow}
        >
          Follow
        </button>
      )}
      {isFollowing(artist?.name) && (
        <button
          className="px-6 py-2 rounded mb-4"
          style={{ background: 'var(--accent)', color: 'white' }}
          onClick={handleUnfollow}
        >
          Unfollow
        </button>
      )}
      <button
        className="px-4 py-2 rounded"
        style={{ background: 'var(--accent)', color: 'var(--foreground)' }}
        onClick={() => router.back()}
      >
        Back
      </button>

      {/* Upcoming Events Section */}
      <div className="w-full max-w-2xl mt-8" style={{ background: 'var(--background)' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--secondary)' }}>Upcoming Events</h2>
  <form className="flex flex-wrap gap-2 mb-4 items-center">
          <label htmlFor="event-state">State:</label>
          <select
            id="event-state"
            value={eventState}
            onChange={e => { setEventState(e.target.value); setEventCity(""); setEventPage(0); }}
            className="border rounded px-2 py-1"
            style={{ color: 'var(--foreground)', background: 'var(--accent)' }}
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
            className="border rounded px-2 py-1"
            style={{ color: 'var(--foreground)', background: 'var(--accent)' }}
            disabled={!eventState}
          >
            <option value="">{eventState ? "All Cities" : "Select a state first"}</option>
            {cityOptions.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </form>
        {events.length === 0 ? (
          <div style={{ color: 'var(--accent)', fontStyle: 'italic' }}>No upcoming events found.</div>
        ) : (
          <ul style={{ borderTop: '1px solid var(--accent)' }}>
            {events.map(event => (
              <li key={event.id} className="py-4 flex flex-col md:flex-row md:items-center gap-4" style={{ borderBottom: '1px solid var(--accent)' }}>
                <div className="flex-1">
                  <div className="font-semibold text-lg" style={{ color: 'var(--secondary)' }}>{event.name}</div>
                  <div style={{ color: 'var(--foreground)' }}>{event.dates?.start?.localDate} {event.dates?.start?.localTime && (<>@ {event.dates.start.localTime}</>)}</div>
                  <div style={{ color: 'var(--foreground)' }}>{event._embedded?.venues?.[0]?.name}, {event._embedded?.venues?.[0]?.city?.name}, {event._embedded?.venues?.[0]?.state?.name}</div>
                  {event.info && <div style={{ color: 'var(--accent)', fontSize: '0.95em', marginTop: '0.25rem' }}>{event.info}</div>}
                  {event.url && <a href={event.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'underline', fontSize: '0.95em' }}>View Event</a>}
                </div>
                {event.images && event.images.length > 0 && (
                  <img
                    src={event.images.reduce((prev, curr) => (curr.width > prev.width ? curr : prev), event.images[0]).url}
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
              className="px-3 py-1 rounded"
              style={{ background: 'var(--secondary)', color: 'white' }}
              onClick={() => setEventPage(p => Math.max(0, p - 1))}
              disabled={eventPage === 0}
            >
              Previous
            </button>
            <span className="px-2">Page {eventPage + 1} of {eventTotalPages}</span>
            <button
              className="px-3 py-1 rounded"
              style={{ background: 'var(--secondary)', color: 'white' }}
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
