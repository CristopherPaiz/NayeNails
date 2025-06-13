const BOT_USER_AGENTS = [
  "whatsapp",
  "twitterbot",
  "facebookexternalhit",
  "telegrambot",
  "pinterest",
  "linkedinbot",
  "discordbot",
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
];

export default async (request, context) => {
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || "no-user-agent";

  const isBot = BOT_USER_AGENTS.some((bot) => userAgent.includes(bot));

  console.log(`[Edge Function] User-Agent: "${userAgent}" -> Es un bot? ${isBot}`);

  if (isBot) {
    const requestUrl = new URL(request.url);
    const backendUrl = `https://nayenailsbackend.onrender.com${requestUrl.pathname}${requestUrl.search}`;

    console.log(`[Edge Function] BOT DETECTADO. Reescribiendo a: ${backendUrl}`);

    return context.rewrite(backendUrl);
  }

  console.log("[Edge Function] Visitante normal. Dejando pasar a la SPA.");
  return;
};
