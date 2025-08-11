import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idToken: string | undefined = body?.id_token;

    if (!idToken) {
      return NextResponse.json(
        { error: 'Missing token: expected id_token' },
        { status: 400 }
      );
    }

    // Fetch user info from Google using id_token
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`
    );
    const email = googleResponse.data.email || '';
    const name = googleResponse.data.name || '';
    const picture = googleResponse.data.picture || '';

    const username = email.split('@')[0];

    const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendBaseUrl) {
      return NextResponse.json(
        { error: 'Backend API URL is not configured' },
        { status: 500 }
      );
    }

    // Prepare payload for backend — using id_token only
    const payload: Record<string, any> = {
      username,
      email,
      user_type: 'customer',
      first_name: name?.split(' ')[0] || '',
      last_name: name?.split(' ').slice(1).join(' ') || '',
      profile_picture: picture || '',
    };
    payload.id_token = idToken;

    const backendResponse = await axios.post(
      `${backendBaseUrl}/api/auth/google/signin/`,
      payload
    );

    const { access, user } = backendResponse.data;

    const nextResponse = NextResponse.json(
      { user, message: 'Successfully signed in with Google' },
      { status: 200 }
    );

    nextResponse.cookies.set('auth_token', access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return nextResponse;
  } catch (error: any) {
    const backendMessage = error?.response?.data || error?.message || 'Unknown error';
    console.error('Google sign-in error:', backendMessage);
    return NextResponse.json(
      { error: 'Failed to sign in with Google', details: backendMessage },
      { status: 500 }
    );
  }
}