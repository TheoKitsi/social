// PRAGMA Push Notification Service Worker
// This file is served from /public and registered by next-pwa

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "PRAGMA", body: event.data.text() };
  }

  const { title, body, data } = payload;

  const options = {
    body: body || "",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag: data?.type || "default",
    data: data || {},
    vibrate: [100, 50, 100],
    actions: [],
  };

  // Add contextual actions
  if (data?.type === "match") {
    options.actions = [
      { action: "view", title: "View Match" },
      { action: "dismiss", title: "Dismiss" },
    ];
  } else if (data?.type === "message") {
    options.actions = [
      { action: "reply", title: "Reply" },
    ];
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let url = "/en/matches";

  if (data.type === "message" && data.conversationId) {
    url = `/en/messages?id=${data.conversationId}`;
  } else if (data.type === "match" && data.matchId) {
    url = `/en/matches?id=${data.matchId}`;
  } else if (data.type === "consent") {
    url = "/en/matches";
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
