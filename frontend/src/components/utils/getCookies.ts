import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Correct way: use the cookies from the request object
  const refreshToken = req.cookies.get("refresh_token")?.value;

  
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token found" }, { status: 401 });
  }

  // You can now call your auth service to validate or refresh the access token
  return NextResponse.json({ success: true, refreshToken });
}
