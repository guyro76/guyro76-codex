import axios from "axios";
import * as cheerio from "cheerio";

export interface NewsArticle {
  title: string;
  summary: string;
  url: string;
  source: string;
  sourceType: string;
  imageUrl?: string;
  publishedAt?: Date;
}

// Fetch from Google News RSS
export async function searchGoogleNews(
  query: string,
  limit: number = 5
): Promise<NewsArticle[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
      query
    )}&gl=US&ceid=US:en`;

    const response = await axios.get(url, { timeout: 8000 });
    const $ = cheerio.load(response.data);

    const articles: NewsArticle[] = [];

    $("item").each((i, elem) => {
      if (articles.length >= limit) return;

      const title = $(elem).find("title").text()?.trim() || "";
      const link = $(elem).find("link").text()?.trim() || "";
      const description = $(elem)
        .find("description")
        .text()
        ?.trim()
        .replace(/<[^>]*>/g, "") || "";
      const pubDate = $(elem).find("pubDate").text()?.trim() || "";

      if (title && link) {
        articles.push({
          title,
          summary: description.substring(0, 200),
          url: link,
          source: "Google News",
          sourceType: "google-news",
          publishedAt: pubDate ? new Date(pubDate) : undefined,
        });
      }
    });

    return articles;
  } catch (error) {
    console.error("Error searching Google News:", error);
    return [];
  }
}

// Fetch from Wikipedia
export async function searchWikipedia(
  query: string,
  limit: number = 3
): Promise<NewsArticle[]> {
  try {
    const response = await axios.get(
      "https://en.wikipedia.org/w/api.php",
      {
        params: {
          action: "query",
          list: "search",
          srsearch: query,
          srlimit: limit,
          format: "json",
          origin: "*",
        },
        timeout: 8000,
      }
    );

    const articles: NewsArticle[] = [];

    if (response.data.query?.search) {
      for (const item of response.data.query.search) {
        articles.push({
          title: item.title,
          summary: item.snippet.replace(/<[^>]*>/g, ""),
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(
            item.title
          )}`,
          source: "Wikipedia",
          sourceType: "wikipedia",
        });
      }
    }

    return articles;
  } catch (error) {
    console.error("Error searching Wikipedia:", error);
    return [];
  }
}

// Combined search across multiple sources
export async function searchContent(
  query: string
): Promise<NewsArticle[]> {
  const [googleNews, wikipedia] = await Promise.all([
    searchGoogleNews(query, 3),
    searchWikipedia(query, 2),
  ]);

  return [...googleNews, ...wikipedia].slice(0, 8);
}

// Extract main image from article URL
export async function extractImageFromUrl(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(response.data);

    // Try various selectors
    const selectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      "img[alt]:first",
      "img:first",
    ];

    for (const selector of selectors) {
      const element = $(selector);
      const content =
        element.attr("content") || element.attr("src");
      if (content && isValidImageUrl(content)) {
        return content;
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting image from URL:", error);
    return null;
  }
}

function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url, "https://example.com");
    return (
      urlObj.protocol === "http:" ||
      urlObj.protocol === "https:"
    );
  } catch {
    return false;
  }
}
