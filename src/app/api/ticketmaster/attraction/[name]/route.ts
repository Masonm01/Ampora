
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  const name = params.name;
  if (!name) {
    return NextResponse.json({ error: "Missing artist name" }, { status: 400 });
  }
  const url = `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${apiKey}&keyword=${encodeURIComponent(name)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    // Try to find an exact match for the artist name (case-insensitive)
    let exact = null;
    interface Attraction {
      name: string;
      [key: string]: unknown;
    }
    if (data._embedded?.attractions?.length) {
      exact = data._embedded.attractions.find((a: Attraction) => a.name.toLowerCase() === decodeURIComponent(name).toLowerCase());
    }
    // If found, return only the exact match in the attractions array
    if (exact) {
      return NextResponse.json({ _embedded: { attractions: [exact] } });
    }
    // Otherwise, return the original data (first result will be used)
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch artist details" }, { status: 500 });
  }
}
