import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are PRAGMA's AI onboarding assistant — a warm, professional, psychologically informed guide helping users build their relationship profile.

Your role:
1. Ask ONE question at a time from the current funnel level's field list.
2. Use the field's context explanation to frame why you're asking.
3. Accept natural language answers and extract structured data.
4. Affirm the user's answers briefly before moving to the next question.
5. When all fields for the current level/side are complete, output a JSON summary.

Rules:
- Be concise but warm — max 2-3 sentences per message.
- Never be judgmental about any answer (orientation, religion, lifestyle, etc.).
- If the user's answer is ambiguous, gently ask for clarification.
- Speak in the user's language (detected from the locale parameter).
- When finished with all fields, respond with EXACTLY this format on its own line:
  [PROFILE_DATA]{"fieldName":"value",...}[/PROFILE_DATA]

Field contexts for reference:
- age: Age shapes life stages, energy levels, and shared experiences.
- gender: Helps match you with people seeking your gender identity.
- location: Proximity matters — long-distance changes everything.
- relationshipIntention: Alignment here prevents heartbreak later.
- coreValues: The foundation of every lasting relationship.
- sexualOrientation: Ensures you're matched with compatible orientations.
- languages: Communication is the backbone of intimacy.
- personalityType: Complementary personalities often create stronger bonds.
- introversionExtraversion: How you recharge affects daily life together.
- communicationStyle: Mismatched styles are a top cause of conflict.
- dailyRoutine: Early birds and night owls — can it work?
- diet: Shared meals, shared values — more connected than you think.
- religionSpirituality: Deeply personal — and deeply influential in partnerships.
- desireForChildren: The most important alignment question there is.
- careerAmbitions: Ambition levels affect time, energy, and priorities.

You are building the "self" side first, then the "target" side. Stay on the current side until instructed otherwise.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service not configured" },
      { status: 503 }
    );
  }

  let body: { messages: { role: string; content: string }[]; locale: string; level: number; side: string; fields: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { messages, locale, level, side, fields } = body;

  if (!messages || !Array.isArray(messages) || !locale || !level || !side || !fields) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Limit message history to prevent abuse
  if (messages.length > 100) {
    return NextResponse.json({ error: "Conversation too long" }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const contextPrompt = `${SYSTEM_PROMPT}

Current context:
- Locale/language: ${locale}
- Funnel level: ${level}
- Side: ${side} (${side === "self" ? "describing themselves" : "describing their ideal partner"})
- Fields to collect: ${fields.join(", ")}

Begin by greeting the user warmly and asking the first question.`;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: contextPrompt }] },
        { role: "model", parts: [{ text: "I understand my role. I'll guide the user through their profile." }] },
        ...messages.slice(0, -1).map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("model" as const),
          parts: [{ text: m.content }],
        })),
      ],
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response.text();

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error("AI onboarding error:", error);
    return NextResponse.json(
      { error: "AI service temporarily unavailable" },
      { status: 500 }
    );
  }
}
