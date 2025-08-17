import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/userModel';
import { triggerVerification } from '@/helpers/triggerVerification';
import { connect } from '@/dbConfig/dbsConfig';

connect();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const user = await User.findOne({ email });
    if (!user) {
      console.error('Resend verification: User not found for email', email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (user.isVerified) {
      console.info('Resend verification: User already verified', email);
      return NextResponse.json({ message: 'User already verified' });
    }
    try {
      await triggerVerification(user);
    } catch (emailErr: any) {
      console.error('Resend verification: Error sending email', emailErr);
      return NextResponse.json({ error: 'Failed to send verification email: ' + emailErr.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Verification email resent' });
  } catch (error: any) {
    console.error('Resend verification: Unexpected error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
