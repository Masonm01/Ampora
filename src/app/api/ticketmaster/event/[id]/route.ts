// app/api/events/[id]/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id?: string }> }
) {
  const { id = "" } = await params; // <-- Next 15: params is a Promise
  const apiKey = process.env.TICKETMASTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing TICKETMASTER_API_KEY" },
      { status: 500 }
    );
  }

  if (!id.trim()) {
    return NextResponse.json({ error: "Missing event id" }, { status: 400 });
  }

  const url = `https://app.ticketmaster.com/discovery/v2/events/${encodeURIComponent(
    id
  )}.json?apikey=${apiKey}`;

  try {
    const res = await fetch(url /*, { next: { revalidate: 60 } } */);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Ticketmaster responded ${res.status}` },
        { status: 502 }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Ticketmaster event fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch event details" },
      { status: 500 }
    );
  }
}
