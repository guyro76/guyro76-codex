import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateCarouselContent } from "@/lib/claude";
import { searchWikimediaImages, verifyImageUrl, isPlaceholderImage } from "@/lib/images";
import { getDimensions, getTemplate } from "@/lib/carousel-config";
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

    // Resolve optional profile (audience/tone) from the local store if present.
    // Auth runs through Supabase, so a Prisma user row is not guaranteed —
    // fall back to sensible defaults from the session.
    let user: {
      id: string;
      audience: string | null;
      tone: string | null;
    } = {
      id: session.user.email,
      audience: "Professional audience",
      tone: "professional",
    };
    try {
      const { prisma } = await import("@/lib/prisma");
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (dbUser) {
        user = { id: dbUser.id, audience: dbUser.audience, tone: dbUser.tone };
      }
    } catch {
      // local store unavailable — proceed with session-derived defaults
    }

    const body = await req.json();
    const {
      topic,
      platform,
      objective,
      theme,
      design = "modern",
      contentType = "carousel",
      articles,
    } = body;

    // Generate carousel content using Claude
    const carouselData = await generateCarouselContent({
      topic,
      platform,
      objective,
      audience: user.audience || "Professional audience",
      tone: user.tone || "professional",
      articles,
    });

    if (!carouselData.slides || carouselData.slides.length !== 7) {
      return NextResponse.json(
        { error: "Claude did not generate exactly 7 slides" },
        { status: 422 }
      );
    }

    // Search for images for each slide
    const slideImages: string[] = [];
    const imageCredits: { url: string; credit: string }[] = [];

    for (const slide of carouselData.slides) {
      try {
        const images = await searchWikimediaImages(slide.imageQuery, 3);

        let foundValidImage = false;

        for (const img of images) {
          // Check if image is placeholder or already used
          if (isPlaceholderImage(img.url) || slideImages.includes(img.url)) {
            continue;
          }

          // Verify image is valid
          const isValid = await verifyImageUrl(img.url);
          if (!isValid) {
            continue;
          }

          slideImages.push(img.url);
          imageCredits.push({
            url: img.url,
            credit: img.source,
          });
          foundValidImage = true;
          break;
        }

        if (!foundValidImage) {
          throw new Error(
            `Could not find valid image for slide: ${slide.headline}`
          );
        }
      } catch (error) {
        console.error(`Error searching images for "${slide.imageQuery}":`, error);
        throw new Error(
          `Failed to find validated image for slide: ${slide.headline}`
        );
      }
    }

    // Verify we have exactly 7 unique images
    if (slideImages.length !== 7 || new Set(slideImages).size !== 7) {
      return NextResponse.json(
        {
          error: "Could not find 7 different valid images. Carousel creation failed. No partial carousels are saved.",
        },
        { status: 422 }
      );
    }

    const dimensions = getDimensions(platform, contentType);
    const templateData = getTemplate(design);

    // Persist best-effort. If the local store is unavailable we still return
    // the generated content with a fallback id so the flow never dead-ends.
    let projectId = `gen_${Date.now()}`;
    try {
      const { prisma } = await import("@/lib/prisma");
      const project = await prisma.project.create({
        data: {
          userId: user.id,
          type: contentType === "story" ? "story" : "carousel",
          topic,
          platform,
          format: contentType,
          theme: theme || "midnight",
          status: "draft",
          content: JSON.stringify({
            slides: carouselData.slides,
            design,
            dimensions,
            template: templateData,
          }),
        },
      });
      projectId = project.id;

      for (let i = 0; i < slideImages.length; i++) {
        await prisma.projectImage.create({
          data: {
            projectId: project.id,
            url: slideImages[i],
            source: imageCredits[i].credit,
            position: i,
          },
        });
      }
    } catch (persistError) {
      console.warn("Carousel persistence skipped:", persistError);
    }

    return NextResponse.json({
      success: true,
      projectId,
      slides: carouselData.slides,
      images: slideImages,
      theme: theme || "midnight",
      design,
      contentType,
      dimensions,
      template: templateData,
      message: `${contentType === "story" ? "סטורי" : "קרוסלה"} נוצר בהצלחה!`,
    });
  } catch (error) {
    console.error("Carousel creation error:", error);
    const message = error instanceof Error ? error.message : "Failed to create carousel";
    return NextResponse.json(
      { error: message },
      { status: 422 }
    );
  }
}
