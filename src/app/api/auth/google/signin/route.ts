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

    // You may want to generate a username from the email or name
    const username = email.split('@')[0]; // or any unique logic

    const backendResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/signin/`,
      {
        username,
        email,
        password: access_token, // or a generated password if needed by your backend
        user_type: "customer",
        first_name: name?.split(' ')[0] || "",
        last_name: name?.split(' ').slice(1).join(' ') || "",
        // Add other fields as needed, e.g. phone, company_name, date_joined
      }
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