import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateCarouselContent } from "@/lib/claude";
import { generateCarouselFallback } from "@/lib/carousel-fallback";
import {
  generatePostFallback,
  generatePresentationFallback,
} from "@/lib/content-fallback";
import { searchWikimediaImages, isPlaceholderImage } from "@/lib/images";
import { getDimensions, getTemplate } from "@/lib/carousel-config";
import { NextRequest, NextResponse } from "next/server";

// Hebrew labels per content type, used in the success message + persistence.
const TYPE_LABELS: Record<string, string> = {
  carousel: "קרוסלה",
  story: "סטורי",
  post: "פוסט",
  presentation: "מצגת",
  reels: "רילס",
};

// A real Anthropic key looks like "sk-ant-...". Anything else (placeholder /
// empty) means we run the free, no-cost generator instead — so creation always
// works without spending money.
const hasAiKey = (process.env.ANTHROPIC_API_KEY || "").startsWith("sk-ant-");

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve optional profile (audience/tone) from the local store if present.
    let user: { id: string; audience: string | null; tone: string | null } = {
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

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { error: "יש להזין נושא לקרוסלה" },
        { status: 400 }
      );
    }

    const genInput = {
      topic,
      platform,
      objective,
      audience: user.audience || "Professional audience",
      tone: user.tone || "professional",
      articles,
    };

    // Free, no-cost generator per content type — a single-image post, a
    // multi-slide presentation, or the 7-slide carousel/story.
    const freeGenerator = () => {
      if (contentType === "post") return generatePostFallback(genInput);
      if (contentType === "presentation")
        return generatePresentationFallback(genInput);
      return generateCarouselFallback(genInput);
    };

    // Content: use Claude only when a real key exists, otherwise the free
    // generator. Even with a key, fall back gracefully on any error. Claude
    // is only wired for the 7-slide carousel/story shape today.
    let carouselData: {
      slides: { headline: string; body: string; imageQuery: string }[];
    };
    const claudeEligible =
      contentType === "carousel" || contentType === "story";
    if (hasAiKey && claudeEligible) {
      try {
        carouselData = await generateCarouselContent(genInput);
        if (!carouselData?.slides || carouselData.slides.length !== 7) {
          carouselData = freeGenerator();
        }
      } catch {
        carouselData = freeGenerator();
      }
    } else {
      carouselData = freeGenerator();
    }

    const dimensions = getDimensions(platform, contentType) || {
      width: 1080,
      height: 1350,
      ratio: "4:5",
    };
    const templateData = getTemplate(design) || getTemplate("modern");

    // Images: try Wikimedia for relevance, but never dead-end — any slide
    // without a valid unique image gets a free, reliable Picsum image so we
    // always end with exactly 7.
    const slideImages: string[] = [];
    const imageCredits: { url: string; credit: string }[] = [];

    for (let i = 0; i < carouselData.slides.length; i++) {
      const slide = carouselData.slides[i];
      let chosen: string | null = null;
      let credit = "";

      try {
        const images = await searchWikimediaImages(slide.imageQuery, 3);
        for (const img of images) {
          if (isPlaceholderImage(img.url) || slideImages.includes(img.url)) {
            continue;
          }
          chosen = img.url;
          credit = img.source;
          break;
        }
      } catch {
        // image search failed — fall through to the free placeholder
      }

      if (!chosen) {
        const seed = encodeURIComponent(`${topic}-${i}-${Date.now()}`);
        chosen = `https://picsum.photos/seed/${seed}/${dimensions.width}/${dimensions.height}`;
        credit = "Picsum (placeholder)";
      }

      slideImages.push(chosen);
      imageCredits.push({ url: chosen, credit });
    }

    // Persist best-effort; never block the response on it.
    let projectId = `gen_${Date.now()}`;
    try {
      const { prisma } = await import("@/lib/prisma");
      const project = await prisma.project.create({
        data: {
          userId: user.id,
          type: contentType || "carousel",
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
      topic,
      slides: carouselData.slides,
      images: slideImages,
      theme: theme || "midnight",
      design,
      contentType,
      dimensions,
      template: templateData,
      aiGenerated: hasAiKey && claudeEligible,
      message: `${TYPE_LABELS[contentType] || "תוכן"} נוצר בהצלחה!`,
    });
  } catch (error) {
    console.error("Carousel creation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create carousel";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
