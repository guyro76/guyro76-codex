import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { niche, audience, tone, platforms } = body;

    // Best-effort persistence. Auth and the dashboard do not depend on this
    // write succeeding, so we never block the onboarding flow on it.
    try {
      const { prisma } = await import("@/lib/prisma");
      const user = await prisma.user.upsert({
        where: { email: session.user.email },
        update: { niche, audience, tone, onboardingComplete: true },
        create: {
          email: session.user.email,
          name: session.user.name || session.user.email.split("@")[0],
          niche,
          audience,
          tone,
          onboardingComplete: true,
        },
      });

      for (const platform of platforms || []) {
        await prisma.connection.upsert({
          where: { userId_platform: { userId: user.id, platform } },
          update: { status: "demo" },
          create: { userId: user.id, platform, status: "demo" },
        });
      }
    } catch (dbError) {
      console.warn("Onboarding persistence skipped:", dbError);
    }

    return NextResponse.json({
      success: true,
      profile: { niche, audience, tone, platforms },
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding" },
      { status: 500 }
    );
  }
}
