import axios from "axios";

interface WikimediaImage {
  source: string;
  title: string;
  url: string;
}

// Search Wikimedia Commons for images
export async function searchWikimediaImages(
  query: string,
  limit: number = 5
): Promise<WikimediaImage[]> {
  try {
    const response = await axios.get(
      "https://commons.wikimedia.org/w/api.php",
      {
        params: {
          action: "query",
          list: "search",
          srsearch: query,
          srnamespace: "6", // File namespace
          srlimit: limit,
          format: "json",
          origin: "*",
        },
        timeout: 5000,
      }
    );

    const results: WikimediaImage[] = [];

    if (response.data.query?.search) {
      for (const item of response.data.query.search) {
        const imageUrl = await getWikimediaImageUrl(item.title);
        if (imageUrl) {
          results.push({
            source: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(
              item.title
            )}`,
            title: item.title,
            url: imageUrl,
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Error searching Wikimedia Commons:", error);
    return [];
  }
}

async function getWikimediaImageUrl(filename: string): Promise<string | null> {
  try {
    const response = await axios.get(
      "https://commons.wikimedia.org/w/api.php",
      {
        params: {
          action: "query",
          titles: `File:${filename}`,
          prop: "imageinfo",
          iiprop: "url",
          format: "json",
          origin: "*",
        },
        timeout: 5000,
      }
    );

    const pages = response.data.query?.pages;
    if (pages) {
      const page = Object.values(pages)[0] as any;
      if (page.imageinfo?.[0]?.url) {
        return page.imageinfo[0].url;
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting Wikimedia image URL:", error);
    return null;
  }
}

// Verify image URL is valid and accessible
export async function verifyImageUrl(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      maxRedirects: 5,
    });

    const contentType = response.headers["content-type"] as string | undefined;
    if (!contentType || typeof contentType !== "string") {
      return false;
    }

    return response.status === 200 && contentType.startsWith("image/");
  } catch (error) {
    console.error("Error verifying image URL:", error);
    return false;
  }
}

// Check if URL is a fake placeholder
export function isPlaceholderImage(url: string): boolean {
  const placeholderPatterns = [
    "lorempixel",
    "placeholder",
    "dummyimage",
    "via.placeholder",
    "picsum.photos",
    "loremflickr",
  ];

  return placeholderPatterns.some((pattern) =>
    url.toLowerCase().includes(pattern)
  );
}
