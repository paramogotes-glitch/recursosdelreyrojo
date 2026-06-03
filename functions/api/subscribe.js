/**
 * Cloudflare Pages Function — Proxy a la API de Brevo (Double Opt-In)
 *
 * Recibe POST con { email } desde el frontend,
 * envía email de confirmación vía POST /contacts/doubleOptinConfirmation.
 * El contacto se añade a la lista solo cuando el usuario confirma.
 *
 * Variables de entorno requeridas en Cloudflare Pages:
 *   BREVO_API_KEY  — clave API v3 de Brevo
 *   BREVO_LIST_ID  — ID numérico de la lista (default: 3)
 */

const DOI_TEMPLATE_ID = 5;
const CONFIRMATION_URL = "https://recursosdelreyrojo.com/dentro";

export async function onRequest(context) {
  const origin = context.request.headers.get("origin") || "";
  const allowedOrigins = [
    "https://recursosdelreyrojo.com",
    "https://www.recursosdelreyrojo.com",
    "http://localhost:4321",
  ];
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const corsHeaders = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Preflight CORS
  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (context.request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // === Parsear body ===
  let email;
  try {
    const body = await context.request.json();
    email = (body.email || "").trim().toLowerCase();
  } catch (_parseErr) {
    return new Response(JSON.stringify({ error: "Petición mal formada" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // === Validación de email ===
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return new Response(JSON.stringify({ error: "Email inválido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // === Variables de entorno ===
  const BREVO_API_KEY = context.env.BREVO_API_KEY;
  const BREVO_LIST_ID = parseInt(context.env.BREVO_LIST_ID, 10) || 3;

  if (!BREVO_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Servicio no configurado — falta API key" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // === Enviar email de doble opt-in ===
  // La API de Brevo envía el email de confirmación y añade el contacto
  // a includeListIds automáticamente cuando el usuario hace clic en el enlace.
  let doiResponse;
  try {
    doiResponse = await fetch(
      "https://api.brevo.com/v3/contacts/doubleOptinConfirmation",
      {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          templateId: DOI_TEMPLATE_ID,
          redirectionUrl: CONFIRMATION_URL,
          includeListIds: [BREVO_LIST_ID],
        }),
      }
    );
  } catch (_fetchErr) {
    return new Response(
      JSON.stringify({ error: "No se pudo conectar con Brevo" }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // === Parsear respuesta ===
  let doiData;
  try {
    doiData = await doiResponse.json();
  } catch (_jsonErr) {
    // 201 suele devolver body vacío, no es error
    if (doiResponse.ok) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(
      JSON.stringify({
        error: `Brevo respondió con estado ${doiResponse.status}`,
      }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  if (!doiResponse.ok) {
    return new Response(
      JSON.stringify({
        error: doiData.message || `Error de Brevo (${doiResponse.status})`,
      }),
      {
        status: doiResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Éxito: email de confirmación enviado
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
