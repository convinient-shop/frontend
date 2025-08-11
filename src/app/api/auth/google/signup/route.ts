import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const accessToken: string | undefined = body?.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing token: expected access_token' },
        { status: 400 }
      );
    }

    // Fetch user info from Google using access_token
    const googleResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } }
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

    // Prepare payload for backend — using access_token only
    const payload: Record<string, any> = {
      username,
      email,
      user_type: 'customer',
      first_name: name?.split(' ')[0] || '',
      last_name: name?.split(' ').slice(1).join(' ') || '',
      profile_picture: picture || '',
    };
    payload.access_token = accessToken;

    const backendResponse = await axios.post(
      `${backendBaseUrl}/api/auth/signup/`,
      payload
    );

    const { access, user } = backendResponse.data;

    const nextResponse = NextResponse.json(
      { user, message: 'Successfully signed up with Google' },
      { status: 200 }
    );

    nextResponse.cookies.set('auth_token', access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return nextResponse;
  } catch (error: any) {
    const backendMessage = error?.response?.data || error?.message || 'Unknown error';
    console.error('Google sign-up error:', backendMessage);
    return NextResponse.json(
      { error: 'Failed to sign up with Google', details: backendMessage },
      { status: 500 }
    );
  }
}