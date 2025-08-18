import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Missing event id" }, { status: 400 });
  }
  const url = `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch event details" }, { status: 500 });
  }
}
