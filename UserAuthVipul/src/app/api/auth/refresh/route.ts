import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/authTokens";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Missing refreshToken" },
        { status: 400 }
      );
    }

    const result = await refreshAccessToken(refreshToken);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[refresh-token] error:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
