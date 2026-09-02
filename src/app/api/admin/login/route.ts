// src/app/api/admin/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signAdminSession } from '@/app/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const expectedEmail = process.env.ADMIN_EMAIL;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedEmail || !expectedPassword) {
      return NextResponse.json(
        { success: false, error: 'Admin credentials missing in configuration.' },
        { status: 500 }
      );
    }

    if (
      email.trim().toLowerCase() !== expectedEmail.toLowerCase() ||
      password !== expectedPassword
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    const token = await signAdminSession(expectedEmail);

    const cookieStore = await cookies();
    cookieStore.set('ckfs_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Login failed.' },
      { status: 500 }
    );
  }
}