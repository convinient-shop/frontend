import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Since Next.js rewrites are handling the routing, we can call the backend directly
    const backendResponse = await axios.post(
      'https://backend-hj5j.onrender.com/api/auth/forgot-password/',
      body,
      { headers: { 'Content-Type': 'application/json' } }
    );

    return NextResponse.json(backendResponse.data, { status: 200 });
  } catch (error: any) {
    const backendMessage = error?.response?.data || error?.message || 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to send reset email', details: backendMessage },
      { status: 500 }
    );
  }
}


