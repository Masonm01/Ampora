// This helper can be used to trigger sending a verification email after signup
import { sendVerificationEmail } from './sendVerificationEmail';
import crypto from 'crypto';
import User from '@/models/userModel';

interface UserType {
  email: string;
  username: string;
  verifyToken?: string;
  verifyTokenExpiry?: number;
  save: () => Promise<void>;
}

export async function triggerVerification(user: UserType) {
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
}
