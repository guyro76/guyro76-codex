export type Category = "SEO" | "GEO" | "AEO" | "Performance";
export type CheckStatus = "pass" | "warning" | "fail" | "info";
export type Priority = "critical" | "high" | "medium" | "opportunity";

export interface AnalysisCheck {
  id: string;
  category: Category;
  title: string;
  status: CheckStatus;
  score: number;
  weight: number;
  priority: Priority;
  finding: string;
  recommendation: string;
  evidence?: string;
}

export interface ContentIdea {
  type: "title" | "description" | "faq" | "section" | "schema" | "robots";
  title: string;
  value: string;
  reason: string;
}

export interface AnalysisResult {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  durationMs: number;
  persisted: boolean;
  scores: {
    overall: number;
    seo: number;
    geo: number;
    aeo: number;
    performance: number;
  };
  response: {
    status: number;
    contentType: string;
    htmlBytes: number;
    redirects: number;
    source: "direct" | "browser-retry" | "reader";
    limited: boolean;
  };
  snapshot: {
    title: string;
    description: string;
    canonical: string;
    robotsMeta: string;
    lang: string;
    dir: string;
    h1: string[];
    h2: string[];
    wordCount: number;
    images: number;
    imagesMissingAlt: number;
    internalLinks: number;
    externalLinks: number;
    questionHeadings: number;
    answerBlocks: number;
    listCount: number;
    tableCount: number;
    schemaTypes: string[];
    jsonLdErrors: number;
    scripts: number;
    lazyImages: number;
    sizedImages: number;
  };
  crawlability: {
    robotsFound: boolean;
    sitemapFound: boolean;
    sitemapUrl: string;
    llmsTxtFound: boolean;
    googlebot: "allowed" | "blocked" | "unknown";
    oaiSearchBot: "allowed" | "blocked" | "unknown";
    gptBot: "allowed" | "blocked" | "unknown";
  };
  checks: AnalysisCheck[];
  contentIdeas: ContentIdea[];
  topKeywords: string[];
}

export interface GenerateRequest {
  type: "hero" | "faq" | "article" | "meta" | "schema" | "about";
  keyword: string;
  audience: string;
  tone: string;
  language: string;
  analysis?: AnalysisResult | null;
}
