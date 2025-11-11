import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) return NextResponse.json({ error: "Invalid password" }, { status: 401 });

    const accessToken = await jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    await prisma.admin.update({
      where: { id: admin.id },
      data: { token: accessToken },
    });

    const res = NextResponse.json(
      {
        message: "Login successful",
        admin: { id: admin.id, username: admin.username },
      },
      { status: 200 }
    );

    res.cookies.set({
      name: "accessToken",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
