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

    console.log(`[Edge Function] BOT DETECTADO. Haciendo fetch a: ${backendUrl}`);

    try {
      // Hacemos la petición al backend nosotros mismos
      const backendResponse = await fetch(backendUrl);

      // Creamos una nueva respuesta con el contenido del backend,
      // pero manteniendo las cabeceras originales que sean importantes.
      const response = new Response(backendResponse.body, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        headers: backendResponse.headers,
      });

      // Aseguramos que la cabecera Content-Type sea text/html
      response.headers.set("Content-Type", "text/html");

      console.log(`[Edge Function] Fetch a backend exitoso. Devolviendo HTML al bot.`);
      return response;
    } catch (error) {
      console.error(`[Edge Function] Error al hacer fetch al backend: ${error.message}`);
      // Si el backend falla, devolvemos una respuesta de error simple.
      return new Response("Error al generar la vista previa.", { status: 500 });
    }
  }

  console.log("[Edge Function] Visitante normal. Dejando pasar a la SPA.");
  return;
};
