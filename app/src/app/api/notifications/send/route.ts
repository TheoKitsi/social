import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createServiceClient } from "@/lib/supabase/service";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@pragma.app";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export async function POST(req: NextRequest) {
  // This endpoint is called server-side (e.g. from a database trigger or cron)
  // Authenticate with a simple bearer token
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.INTERNAL_API_TOKEN;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { userId, title, body: messageBody, data } = body as {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  };

  if (!userId || !title || !messageBody) {
    return NextResponse.json(
      { error: "Missing userId, title, or body" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  // Store notification in DB
  await supabase.from("notifications").insert({
    user_id: userId,
    type: data?.type || "general",
    title,
    body: messageBody,
    data: data || {},
  });

  // Get all push subscriptions for this user
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subscriptions?.length) {
    return NextResponse.json({ sent: 0, stored: true });
  }

  const payload = JSON.stringify({ title, body: messageBody, data });

  let sent = 0;
  const stale: string[] = [];

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
      sent++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode === 410 || statusCode === 404) {
        stale.push(sub.endpoint);
      }
    }
  }

  // Clean up expired subscriptions
  if (stale.length) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", userId)
      .in("endpoint", stale);
  }

  return NextResponse.json({ sent, stored: true });
}
