import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ExternalSignals } from "@/types/connectors";

const SIGNAL_EXTRACTION_PROMPT = `You are PRAGMA's adaptive signal extraction engine. Your task is to analyze user data from external services and extract ONLY personality traits, preferences, and behavioral signals — NEVER reproduce or store the raw data.

CRITICAL RULES:
1. Output ONLY a valid JSON object matching the ExternalSignals schema below.
2. Extract abstract personality traits, NOT specific content details.
3. Never include usernames, real names, email addresses, or other PII.
4. Never include specific URLs, titles, or identifiable content.
5. Score numeric fields between 0.0 and 1.0.
6. Include only signals you can infer with reasonable confidence.
7. Set the confidence field based on data volume and signal clarity.

ExternalSignals schema:
{
  "interests": string[],              // abstract interest categories (e.g. "cooking", "science", "travel")
  "content_depth": "casual" | "moderate" | "deep_diver",
  "genre_affinity": string[],         // abstract genres (e.g. "documentary", "comedy", "thriller")
  "curiosity_score": number,          // 0-1, breadth of interests
  "cultural_openness": number,        // 0-1, diversity of content/interests
  "communication_style": "direct" | "diplomatic" | "analytical" | "expressive",
  "intellectual_depth": "practical" | "moderate" | "philosophical",
  "humor_style": "dry" | "sarcastic" | "slapstick" | "intellectual" | "warm",
  "social_energy": "low" | "moderate" | "high",
  "aesthetic_sense": string[],        // abstract aesthetic preferences
  "lifestyle_indicators": string[],   // abstract lifestyle traits
  "values": string[],                 // inferred value system
  "mood_patterns": string[],          // emotional tendencies
  "openness_to_experience": number,   // 0-1, Big Five trait
  "conscientiousness": number         // 0-1, Big Five trait
}

Respond with ONLY the JSON object. No markdown, no explanation.`;

const PROVIDER_PROMPTS: Record<string, string> = {
  youtube: `Analyze this YouTube watch history / subscription data. 
Focus on: content depth (educational vs entertainment), genre diversity, cultural openness (international content), intellectual curiosity patterns, and consistency of interests.`,

  spotify: `Analyze this Spotify listening data.
Focus on: genre diversity, mood patterns from music choices, energy levels, openness to new music, listening depth (albums vs singles), cultural breadth.`,

  netflix: `Analyze this Netflix viewing history.
Focus on: genre preferences, binge patterns (dedication/patience), content diversity, preference for complexity vs simplicity, international content consumption.`,

  amazon: `Analyze this Amazon purchase history.
Focus on: lifestyle priorities, hobby investments, practical vs aspirational purchases, gift-giving patterns (social awareness), category diversity.`,

  ebay: `Analyze this eBay activity.
Focus on: collecting interests, niche passions, resourcefulness, patience (auction vs buy-now), category patterns.`,

  chatgpt: `Analyze these AI assistant conversations.
Focus on: communication style (formal/casual/analytical), intellectual interests, problem-solving approach, values revealed through questions, creativity level, emotional intelligence.`,

  claude: `Analyze these AI assistant conversations.
Focus on: reasoning patterns, analytical depth, creativity, philosophical inclination, communication precision, intellectual curiosity breadth.`,

  instagram: `Analyze this Instagram activity data.
Focus on: aesthetic preferences, social energy level, self-expression style, interest patterns from captions/hashtags, activity frequency.`,

  x: `Analyze this X/Twitter activity data.
Focus on: communication directness, humor style, opinion strength, engagement patterns, topics of interest, social energy.`,

  google_takeout: `Analyze this Google activity data (search/browsing history).
Focus on: knowledge breadth, curiosity patterns, learning style, daily interest rhythms, depth of research on topics.`,
};

export async function extractSignals(
  provider: string,
  rawContent: string
): Promise<{ signals: ExternalSignals; confidence: number }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const providerContext = PROVIDER_PROMPTS[provider] || "Analyze this user data and extract personality signals.";

  // Truncate content to avoid token limits (keep first 100KB)
  const truncated = rawContent.length > 100_000
    ? rawContent.slice(0, 100_000) + "\n\n[... truncated for analysis ...]"
    : rawContent;

  const result = await model.generateContent([
    { text: SIGNAL_EXTRACTION_PROMPT },
    { text: providerContext },
    { text: `USER DATA (process in-memory, extract signals, discard raw data):\n\n${truncated}` },
  ]);

  const text = result.response.text().trim();

  // Parse JSON — strip markdown fences if present
  let jsonStr = text;
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  let signals: ExternalSignals;
  try {
    signals = JSON.parse(jsonStr);
  } catch {
    // Fallback: try to extract JSON from the response
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      signals = JSON.parse(match[0]);
    } else {
      throw new Error("Failed to parse AI response as JSON");
    }
  }

  // Calculate confidence based on how many fields were filled
  const fields = Object.entries(signals).filter(
    ([, v]) => v !== null && v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  );
  const confidence = Math.min(0.95, Math.max(0.3, fields.length / 15));

  return { signals, confidence };
}
