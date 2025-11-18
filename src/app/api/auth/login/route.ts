import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const userLogin = await prisma.userLogin.findUnique({ where: { username } });

    if (!userLogin)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isValid = await bcrypt.compare(password, userLogin.password);

    if (!isValid)
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });

    const payload = {
      id: userLogin.userId,
      username: userLogin.username,
      role: userLogin.role,       // ADMIN | TEACHER | STUDENT
      type: userLogin.userType,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    await prisma.userLogin.update({
      where: { id: userLogin.id },
      data: { token },
    });

    const res = NextResponse.json({ message: "Success", user: payload });

    res.cookies.set({
      name: "accessToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
