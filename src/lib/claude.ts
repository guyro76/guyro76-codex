import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateCarouselContent(input: {
  topic: string;
  platform: string;
  objective: string;
  audience: string;
  tone: string;
  articles?: string[];
}) {
  const articlesText =
    input.articles && input.articles.length > 0
      ? `Here are relevant articles/sources:\n${input.articles.join("\n\n")}`
      : "";

  const prompt = `You are a professional content creator creating a carousel for ${input.platform}.

Topic: ${input.topic}
Platform: ${input.platform}
Objective: ${input.objective}
Target Audience: ${input.audience}
Tone: ${input.tone}

${articlesText}

Create 7 carousel slides with the following structure:
1. A hook slide that grabs attention
2-6. Educational or valuable content (split into 5 slides)
7. A strong call-to-action

For each slide, provide:
- Headline (2-10 words)
- Body text (20-100 words)
- Image search query (specific, detailed, relevant)

Format as JSON with this structure:
{
  "slides": [
    {
      "headline": "...",
      "body": "...",
      "imageQuery": "..."
    }
  ]
}`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse Claude response as JSON");
  }

  return JSON.parse(jsonMatch[0]);
}

export async function generateBrandKit(input: {
  niche: string;
  audience: string;
  tone: string;
}) {
  const prompt = `Create a professional brand kit for a content creator.

Niche: ${input.niche}
Target Audience: ${input.audience}
Tone: ${input.tone}

Provide a JSON response with:
{
  "positioning": "one-liner positioning statement",
  "bios": ["3 versions of bio - short, medium, long"],
  "pillars": ["5 content pillars"],
  "ctas": ["3 unique call-to-action phrases"],
  "signaturePhrases": ["3 signature phrases to use in content"],
  "visualStyle": "description of visual style preferences"
}`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse Claude response as JSON");
  }

  return JSON.parse(jsonMatch[0]);
}

export async function generatePostContent(input: {
  topic: string;
  platform: string;
  objective: string;
  tone: string;
}) {
  const prompt = `Create a social media post for ${input.platform}.

Topic: ${input.topic}
Objective: ${input.objective}
Tone: ${input.tone}

Provide JSON with:
{
  "title": "post title",
  "shortVersion": "short version (100 words)",
  "longVersion": "long version (300 words)",
  "cta": "call to action",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "hook": "opening line"
}`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse Claude response as JSON");
  }

  return JSON.parse(jsonMatch[0]);
}
