import * as z from "zod";
import { NextResponse, NextRequest } from "next/server";
import { hashPassword } from "@/lib/Hasher";
import { PrismaClient } from "@prisma/client";
import { serialize } from "cookie";
import { signToken } from "@/lib/Jwt";

const prisma = new PrismaClient();

const userObj = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const parsedBody = userObj.safeParse(await request.json());

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsedBody.error },
        { status: 400 }
      );
    }
    const { name, email, password } = parsedBody.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    const token = signToken({ userId: user.id, email: user.email });

    return NextResponse.json(
      { message: "User registered successfully", token: token },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
