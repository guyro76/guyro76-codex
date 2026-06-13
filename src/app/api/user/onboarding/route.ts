import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { niche, audience, tone, platforms } = body;

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        niche,
        audience,
        tone,
        onboardingComplete: true,
      },
    });

    // Create demo connections for selected platforms
    for (const platform of platforms || []) {
      await prisma.connection.upsert({
        where: {
          userId_platform: {
            userId: user.id,
            platform,
          },
        },
        update: { status: "demo" },
        create: {
          userId: user.id,
          platform,
          status: "demo",
        },
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding" },
      { status: 500 }
    );
  }
}
