/**
 * Provider-specific data parsers.
 * Each parser takes raw file content and returns a cleaned text summary
 * suitable for AI signal extraction. No PII is preserved.
 */

import { unzipSync } from "fflate";

/** Parse CSV content — extracts column-value pairs, strips PII columns */
function parseCSV(content: string, piiColumns: string[] = []): string {
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return "";

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const safeCols = headers.map((h, i) => ({
    index: i,
    name: h,
    isPII: piiColumns.some(
      (pii) => h.toLowerCase().includes(pii.toLowerCase())
    ),
  }));

  const rows = lines.slice(1, 5001); // Cap at 5000 rows
  const safeData = rows.map((row) => {
    const values = row.split(",").map((v) => v.trim().replace(/"/g, ""));
    return safeCols
      .filter((col) => !col.isPII)
      .map((col) => `${col.name}: ${values[col.index] || ""}`)
      .join(", ");
  });

  return safeData.join("\n");
}

/** Extract text files from ZIP archive */
function extractZip(buffer: Buffer): Record<string, string> {
  const decompressed = unzipSync(new Uint8Array(buffer));
  const files: Record<string, string> = {};

  for (const [path, data] of Object.entries(decompressed)) {
    // Only process text/JSON files, skip binaries
    if (
      path.endsWith(".json") ||
      path.endsWith(".csv") ||
      path.endsWith(".txt") ||
      path.endsWith(".html")
    ) {
      const text = new TextDecoder().decode(data);
      // Cap individual files at 50KB
      files[path] = text.length > 50_000 ? text.slice(0, 50_000) : text;
    }
  }

  return files;
}

/** Strip PII patterns from text */
function stripPII(text: string): string {
  return text
    // Email addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[email]")
    // Phone numbers
    .replace(/\+?[\d\s()-]{10,}/g, "[phone]")
    // URLs with usernames
    .replace(/https?:\/\/[^\s]+/g, "[url]")
    // IP addresses
    .replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, "[ip]");
}

export const parsers: Record<
  string,
  (content: string | Buffer, fileName?: string) => string
> = {
  youtube(content: string | Buffer) {
    const text = typeof content === "string" ? content : content.toString();
    // YouTube Takeout JSON or watch history
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        return data
          .slice(0, 2000)
          .map((item: Record<string, unknown>) => {
            const title = (item.title as string) || "";
            const channel = (item.subtitles as Array<{ name: string }>)?.[0]?.name || "";
            return `Watched: ${title} (${channel})`;
          })
          .join("\n");
      }
    } catch {
      // Might be CSV format
    }
    return stripPII(text);
  },

  spotify(content: string | Buffer) {
    const text = typeof content === "string" ? content : content.toString();
    // Spotify API response (top tracks/artists)
    try {
      const data = JSON.parse(text);
      const items = data.items || data;
      if (Array.isArray(items)) {
        return items
          .slice(0, 500)
          .map((item: Record<string, unknown>) => {
            const name = (item.name as string) || "";
            const artist =
              (item.artists as Array<{ name: string }>)?.[0]?.name ||
              (item.artist as string) ||
              "";
            const genres = (item.genres as string[]) || [];
            return `${name} by ${artist}${genres.length ? ` [${genres.join(", ")}]` : ""}`;
          })
          .join("\n");
      }
    } catch {
      // Fallback
    }
    return stripPII(text);
  },

  netflix(content: string | Buffer) {
    return parseCSV(typeof content === "string" ? content : content.toString(), ["Profile Name", "email", "name", "user"]);
  },

  amazon(content: string | Buffer) {
    return parseCSV(typeof content === "string" ? content : content.toString(), [
      "name",
      "email",
      "address",
      "phone",
      "Shipping Address",
      "Buyer",
      "Payment",
    ]);
  },

  ebay(content: string | Buffer) {
    return parseCSV(typeof content === "string" ? content : content.toString(), [
      "name",
      "email",
      "address",
      "phone",
      "buyer",
      "seller",
      "Shipping",
    ]);
  },

  chatgpt(content: string | Buffer) {
    const buffer = typeof content === "string" ? Buffer.from(content, "base64") : content;
    const files = extractZip(buffer);

    // Look for conversations.json
    const convFile =
      Object.entries(files).find(([p]) => p.includes("conversations.json")) ||
      Object.entries(files).find(([p]) => p.endsWith(".json"));

    if (!convFile) return "";

    try {
      const conversations = JSON.parse(convFile[1]);
      if (Array.isArray(conversations)) {
        return conversations
          .slice(0, 200)
          .map((conv: Record<string, unknown>) => {
            const title = (conv.title as string) || "Untitled";
            const messages =
              (conv.mapping as Record<string, Record<string, unknown>>) || {};
            const userMessages = Object.values(messages)
              .filter(
                (m) =>
                  ((m.message as Record<string, unknown>)?.author as Record<string, unknown>)?.role ===
                  "user"
              )
              .map(
                (m) =>
                  (((m.message as Record<string, unknown>)?.content as Record<string, unknown>)
                    ?.parts as unknown[])?.[0] || ""
              )
              .slice(0, 5);
            return `Topic: ${title}\nUser messages: ${stripPII(userMessages.join(" | "))}`;
          })
          .join("\n\n");
      }
    } catch {
      // Fallback to raw text
    }

    return stripPII(Object.values(files).join("\n").slice(0, 100_000));
  },

  claude(content: string | Buffer) {
    // Similar structure to ChatGPT exports
    return parsers.chatgpt(content);
  },

  instagram(content: string | Buffer) {
    const text = typeof content === "string" ? content : content.toString();
    // Instagram API data
    try {
      const data = JSON.parse(text);
      const media = data.data || data;
      if (Array.isArray(media)) {
        return media
          .slice(0, 500)
          .map((item: Record<string, unknown>) => {
            const caption = (item.caption as string) || "";
            const type = (item.media_type as string) || "";
            return `[${type}] ${stripPII(caption)}`;
          })
          .join("\n");
      }
    } catch {
      // Fallback
    }
    return stripPII(text);
  },

  x(content: string | Buffer) {
    const text = typeof content === "string" ? content : content.toString();
    // X/Twitter API data
    try {
      const data = JSON.parse(text);
      const tweets = data.data || data;
      if (Array.isArray(tweets)) {
        return tweets
          .slice(0, 1000)
          .map((tweet: Record<string, unknown>) => {
            const tweetText = (tweet.text as string) || "";
            return stripPII(tweetText);
          })
          .join("\n");
      }
    } catch {
      // Fallback
    }
    return stripPII(text);
  },

  google_takeout(content: string | Buffer) {
    const buffer = typeof content === "string" ? Buffer.from(content, "base64") : content;
    const files = extractZip(buffer);

    const relevantFiles = Object.entries(files)
      .filter(
        ([p]) =>
          p.includes("Search") ||
          p.includes("YouTube") ||
          p.includes("Chrome") ||
          p.includes("Activity")
      )
      .slice(0, 20);

    const combined = relevantFiles
      .map(([path, content]) => `--- ${path} ---\n${stripPII(content)}`)
      .join("\n\n");

    return combined.slice(0, 100_000);
  },
};

export function parseProviderData(
  provider: string,
  content: string | Buffer,
  fileName?: string
): string {
  const parser = parsers[provider];
  if (!parser) {
    return stripPII(typeof content === "string" ? content : content.toString()).slice(0, 100_000);
  }
  return parser(content, fileName);
}
