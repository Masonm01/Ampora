import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/userModel';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';
import crypto from 'crypto';
import { connect } from '@/dbConfig/dbsConfig';

connect();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (user.isVerified) {
      return NextResponse.json({ message: 'User already verified' });
    }
    // Generate token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenExpiry = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
    user.verifyToken = verifyToken;
    user.verifyTokenExpiry = verifyTokenExpiry;
    await user.save();
    // Send email
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${verifyToken}`;
    await sendVerificationEmail({
      to: user.email,
      username: user.username,
      verifyUrl,
    });
    return NextResponse.json({ message: 'Verification email sent' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
