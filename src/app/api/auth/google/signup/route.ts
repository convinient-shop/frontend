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
    const { email, name, picture } = googleResponse.data;
    const username = email.split('@')[0];

    // Prepare payload matching backend API schema exactly
    const payload = {
      id_token: idToken, // Backend requires this field
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

    // Since Next.js rewrites are handling the routing, we can call the backend directly
    const backendResponse = await axios.post(
      'https://backend-hj5j.onrender.com/api/auth/google/signin/',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { access, refresh, user } = backendResponse.data;

    const nextResponse = NextResponse.json(
      { user, access, refresh, message: 'Successfully signed up with Google' },
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

//Test 
