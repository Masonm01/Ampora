
import { NextRequest} from "next/server";

// app/api/artist/[name]/route.ts
import { NextResponse } from "next/server";

// If you accidentally set edge earlier and need env vars, keep this on Node:
export const runtime = "nodejs";

type TMAttraction = { name: string; [k: string]: unknown };
type TMResponse = {
  _embedded?: { attractions?: TMAttraction[] };
  [k: string]: unknown;
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  const name = (await params).name.trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing TICKETMASTER_API_KEY" },
      { status: 500 }
    );
  }

  if (!name) {
    return NextResponse.json(
      { error: "Missing artist name" },
      { status: 400 }
    );
  }

  const url = `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${apiKey}&keyword=${encodeURIComponent(
    name
  )}`;

  try {
    const res = await fetch(url, {
      // Optional: make responses cacheable if you want
      // next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Ticketmaster responded ${res.status}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as TMResponse;

    const attractions = data._embedded?.attractions ?? [];

    // Exact, case-insensitive match
    const exact = attractions.find(
      (a) => typeof a.name === "string" && a.name.toLowerCase() === name.toLowerCase()
    );

    if (exact) {
      return NextResponse.json({ _embedded: { attractions: [exact] } });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Ticketmaster fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch artist details" },
      { status: 500 }
    );
  }
}