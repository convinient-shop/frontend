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

    const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendBaseUrl) {
      return NextResponse.json(
        { error: 'Backend API URL is not configured' },
        { status: 500 }
      );
    }

    // Fetch user info from Google using id_token
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`
    );
    const { email, name, picture } = googleResponse.data;
    const username = email.split('@')[0];

    // Prepare payload matching backend API schema exactly
    const payload = {
      username: username,
      email: email,
      password: '', // Backend expects this field but it's not used for Google auth
      user_type: "customer",
      phone: "",
      company_name: "",
      first_name: name?.split(' ')[0] || "",
      last_name: name?.split(' ').slice(1).join(' ') || "",
      date_joined: new Date().toISOString(),
      profile_picture: picture || "",
    };

    const backendResponse = await axios.post(
      `${backendBaseUrl}/api/auth/signup/`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
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