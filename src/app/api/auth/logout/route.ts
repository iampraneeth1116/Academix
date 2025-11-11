import { NextResponse } from "next/server";

export async function POST() {
  try {
    const res = NextResponse.json(
      { message: "Logout successful" },
      { status: 200 }
    );

    res.cookies.delete("accessToken");

    return res;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
