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

    // Prepare payloads: JSON and form-encoded (for compatibility)
    const jsonPayload: Record<string, any> = {
      id_token: idToken,
      idToken: idToken,
      token: idToken,
    };
    const formPayload = new URLSearchParams();
    formPayload.set('id_token', idToken);
    formPayload.set('idToken', idToken);
    formPayload.set('token', idToken);

    let backendResponse;
    try {
      backendResponse = await axios.post(
        `${backendBaseUrl}/api/auth/google/signin/`,
        jsonPayload,
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (err: any) {
      // Retry with form-encoded body if JSON fails
      backendResponse = await axios.post(
        `${backendBaseUrl}/api/auth/google/signin/`,
        formPayload.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
    }

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