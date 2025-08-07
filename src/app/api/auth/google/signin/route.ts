import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { id_token } = await request.json();

    // Get user info from Google using id_token
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${id_token}`
    );

    const { email, name, picture } = googleResponse.data;
    const username = email.split('@')[0];

    // Prepare payload for backend
    const payload = {
      id_token, // Send id_token to backend
      username,
      email,
      user_type: "customer",
      first_name: name?.split(' ')[0] || "",
      last_name: name?.split(' ').slice(1).join(' ') || "",
      profile_picture: picture || "",
    };

    // Send to backend
    const backendResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/signin/`,
      payload
    );

    const { access, refresh, user } = backendResponse.data;

    // Set the auth token in cookies
    const nextResponse = NextResponse.json(
      { user, message: 'Successfully signed in with Google' },
      { status: 200 }
    );

    nextResponse.cookies.set('auth_token', access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return nextResponse;
  } catch (error) {
    console.error('Google sign-in error:', error);
    return NextResponse.json(
      { error: 'Failed to sign in with Google' },
      { status: 500 }
    );
  }
}