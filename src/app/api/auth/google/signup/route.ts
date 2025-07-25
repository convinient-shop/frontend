import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { access_token } = await request.json();

    // Get user info from Google
    const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const { email, name, picture } = googleResponse.data;

    // Prepare user payload for backend
    const username = email.split('@')[0];
    const payload = {
      username,
      email,
      user_type: "customer",
      first_name: name?.split(' ')[0] || "",
      last_name: name?.split(' ').slice(1).join(' ') || "",
      // Add other fields if needed: phone, company_name, date_joined, etc.
    };

    // Send to backend
    const backendResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/signup/`,
      payload
    );

    const { access, refresh, user } = backendResponse.data;

    // Set the auth token in cookies
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
  } catch (error) {
    console.error('Google sign-up error:', error);
    return NextResponse.json(
      { error: 'Failed to sign up with Google' },
      { status: 500 }
    );
  }
}