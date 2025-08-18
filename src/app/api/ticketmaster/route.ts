import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const state = searchParams.get("state");
  const page = searchParams.get("page") || "0";
  const size = searchParams.get("size") || "20";
  const keyword = searchParams.get("keyword");
  let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&size=${size}&page=${page}&classificationName=music`;
  if (city) {
    url += `&city=${encodeURIComponent(city)}`;
  }
  if (state) {
    url += `&stateCode=${encodeURIComponent(state)}`;
  }
  if (keyword) {
    url += `&keyword=${encodeURIComponent(keyword)}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
