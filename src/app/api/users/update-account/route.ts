import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";
import { connect } from '@/dbConfig/dbsConfig';

connect();

export async function POST(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);
    const body = await request.json();
  const update: Record<string, unknown> = {};
    if (body.username) update.username = body.username;
    if (body.state) update.state = body.state;
    if (body.city) update.city = body.city;
    // Only allow password change if oldPassword and newPassword are provided
    if (body.oldPassword && body.newPassword) {
      const user = await User.findById(userId);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      const isMatch = await user.comparePassword(body.oldPassword);
      if (!isMatch) return NextResponse.json({ error: "Old password incorrect" }, { status: 400 });
      user.password = body.newPassword;
      await user.save();
      return NextResponse.json({ message: "Password updated" });
    }
    // Update username, city, state
    if (Object.keys(update).length > 0) {
      await User.findByIdAndUpdate(userId, update);
      return NextResponse.json({ message: "Account info updated" });
    }
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
