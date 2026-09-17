import "server-only";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectToDatabase } from "./mongodb";
import User, { IUser } from "@/models/User";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "halo_luxe_fallback_secret_32_characters_long_secure_token";
const key = new TextEncoder().encode(JWT_SECRET);
export const CUSTOMER_COOKIE_NAME = "halo_customer_session";

export interface CustomerSessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

/**
 * Hash a plain text password with bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password against hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign a session JWT for an authenticated customer.
 */
export async function signCustomerToken(
  payload: CustomerSessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

/**
 * Verify a customer session JWT.
 */
export async function verifyCustomerToken(
  token: string
): Promise<CustomerSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as CustomerSessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Set customer session cookie in Next.js response.
 */
export async function setCustomerSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Remove customer session cookie (logout).
 */
export async function clearCustomerSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  try {
    cookieStore.delete(CUSTOMER_COOKIE_NAME);
  } catch (_) {}
}

/**
 * Get current customer session from cookie.
 */
export async function getCustomerSession(): Promise<CustomerSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

/**
 * Require an authenticated customer.
 */
export async function requireCustomer(): Promise<CustomerSessionPayload> {
  const session = await getCustomerSession();
  if (!session) {
    throw new Error("Unauthorized: Customer authentication required");
  }
  return session;
}
