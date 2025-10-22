import { NextRequest, NextResponse } from "next/server";
import { useRouter } from "next/router";
import { PrismaClient } from "@prisma/client";
import * as z from "zod";

const prisma = new PrismaClient();

const resetPasswordObj = z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // params.id is the params from the route [id]
  const parsedBody = resetPasswordObj.safeParse(await req.json());

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid request data", details: parsedBody.error },
      { status: 400 }
    );
  }

  if (parsedBody.data.password !== parsedBody.data.confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match" },
      { status: 400 }
    );
  }

  try {
    const resetRequest = await prisma.forgotPassword.findUnique({
      where: {
        id: params.id,
      },
    });
    if (!resetRequest) {
      return NextResponse.json(
        { error: "Invalid password reset request" },
        { status: 404 }
      );
    }

    if (resetRequest.used) {
      return NextResponse.json(
        { error: "This password reset link has already been used" },
        { status: 400 }
      );
    }

    if (resetRequest.validUntil < new Date()) {
      return NextResponse.json(
        { error: "This password reset link has expired" },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
