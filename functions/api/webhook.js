/**
 * Cloudflare Pages Function — Webhook de Brevo
 *
 * Recibe eventos de Brevo (unsubscribed, hardBounce, spam, etc.)
 * y los registra. Los webhooks se configuran en Brevo > Settings > Webhooks.
 *
 * Eventos suscritos: unsubscribed, hardBounce, spam
 * URL: https://recursosdelreyrojo.com/api/webhook
 */

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let payload;
  try {
    payload = await context.request.json();
  } catch (_err) {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Brevo envía un array de eventos o un solo evento según configuración
  const events = Array.isArray(payload) ? payload : [payload];

  for (const event of events) {
    const { event: eventType, email, date, tag, subject } = event;

    // Log estructurado — visible en logs de Cloudflare Pages (dashboard > Workers & Pages > tu-proyecto > Functions)
    console.log(
      JSON.stringify({
        source: "brevo-webhook",
        event: eventType,
        email,
        date,
        tag,
        subject,
      })
    );

    // Si quieres filtrar por tipo de evento en el futuro:
    // if (eventType === "unsubscribed") { ... }
    // if (eventType === "hardBounce") { ... }
    // if (eventType === "spam") { ... }
  }

  return new Response("OK", { status: 200 });
}
