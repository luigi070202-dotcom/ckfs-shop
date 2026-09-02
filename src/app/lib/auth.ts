// src/app/lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET || 'ckfs-fallback-super-secret-key-32-chars-minimum'
);

export async function signAdminSession(email: string) {
  return await new SignJWT({ email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Automatically expires after 24 hours
    .sign(SECRET_KEY);
}

export async function verifyAdminSession(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch {
    return null;
  }
}