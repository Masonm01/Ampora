"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";

const EventDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/ticketmaster/event/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load event details.");
        return res.json();
      })
      .then(data => {
        setEvent(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load event details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="flex flex-col items-center justify-center min-h-screen py-2">Loading...</div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-screen py-2">{error}</div>;
  if (!event) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-3xl font-bold mb-4 text-center">{event.name}</h1>
      {event.images && event.images.length > 0 && (
        (() => {
          // Pick the largest image by width
          const bestImg = event.images.reduce((prev: any, curr: any) => (curr.width > prev.width ? curr : prev), event.images[0]);
          return <img src={bestImg.url} alt={event.name} className="w-80 h-48 object-cover rounded mb-4" />;
        })()
      )}
      {/* Event Description */}
      {event.info && (
        <div className="mb-4 max-w-xl text-center text-gray-700 italic">{event.info}</div>
      )}
      {/* Date and Time */}
      {event.dates?.start?.dateTime && (
        <div className="mb-2 text-center">
          <strong>Date & Time:</strong> {new Date(event.dates.start.dateTime).toLocaleString()}
        </div>
      )}
      {event._embedded?.venues && (
        <div className="mb-2 text-center">
          <strong>Venue:</strong> {event._embedded.venues[0].name}<br />
          {event._embedded.venues[0].address?.line1}, {event._embedded.venues[0].city?.name}, {event._embedded.venues[0].state?.name}
        </div>
      )}
      {event.url && (
        <a href={event.url} target="_blank" rel="noopener noreferrer" className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Buy Tickets</a>
      )}
      <button
        onClick={() => router.back()}
        className="mt-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
      >
        Back to Profile
      </button>
    </div>
  );
};

export default EventDetailsPage;
