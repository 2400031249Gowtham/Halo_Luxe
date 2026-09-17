import { NextResponse } from "next/server";
import { clearCustomerSessionCookie, CUSTOMER_COOKIE_NAME } from "@/lib/customerAuth";

export async function POST() {
  try {
    await clearCustomerSessionCookie();
    const response = NextResponse.json({ success: true, message: "Logged out successfully." });
    response.cookies.set(CUSTOMER_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    try {
      response.cookies.delete(CUSTOMER_COOKIE_NAME);
    } catch (_) {}
    return response;
  } catch (error: any) {
    console.error("[Logout Error]", error);
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}
