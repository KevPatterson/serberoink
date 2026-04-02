import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/cms-auth';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return res;
}
