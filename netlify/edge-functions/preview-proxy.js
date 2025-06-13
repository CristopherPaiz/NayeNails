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
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";

  const isBot = BOT_USER_AGENTS.some((bot) => userAgent.includes(bot));

  if (isBot) {
    const requestUrl = new URL(request.url);
    const backendUrl = `https://nayenailsbackend.onrender.com${requestUrl.pathname}${requestUrl.search}`;

    return context.rewrite(backendUrl);
  }

  return;
};
