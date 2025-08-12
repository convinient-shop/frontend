import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Since Next.js rewrites are handling the routing, we can call the backend directly
    const backendResponse = await axios.post(
      'https://backend-hj5j.onrender.com/api/auth/signup/',
      body,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { access, refresh, user } = backendResponse.data;

    const nextResponse = NextResponse.json(
      { user, access, refresh, message: 'Successfully signed up' },
      { status: 201 }
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
    return NextResponse.json(
      { error: 'Failed to sign up', details: backendMessage },
      { status: 500 }
    );
  }
}


