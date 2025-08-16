import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";
import { connect } from '@/dbConfig/dbsConfig';

connect();

export async function POST(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);
    const { artist } = await request.json();
    if (!artist) return NextResponse.json({ error: "Artist required" }, { status: 400 });
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (!user.followedArtists.includes(artist)) {
      user.followedArtists.push(artist);
      await user.save();
    }
    return NextResponse.json({ message: "Artist followed", followedArtists: user.followedArtists });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);
    const { artist } = await request.json();
    if (!artist) return NextResponse.json({ error: "Artist required" }, { status: 400 });
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    user.followedArtists = user.followedArtists.filter((a: string) => a !== artist);
    await user.save();
    return NextResponse.json({ message: "Artist unfollowed", followedArtists: user.followedArtists });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
