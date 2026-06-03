/**
 * Cloudflare Pages Function — Proxy a la API de Brevo
 *
 * Recibe POST con { email } desde el frontend,
 * reenvía a POST https://api.brevo.com/v3/contacts
 * sin exponer la API key al cliente.
 *
 * Variables de entorno requeridas en Cloudflare Pages:
 *   BREVO_API_KEY  — clave API v3 de Brevo
 *   BREVO_LIST_ID  — ID numérico de la lista (default: 3)
 */

export async function onRequest(context) {
  // CORS: solo aceptar desde el dominio propio
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

  try {
    const body = await context.request.json();
    const email = (body.email || "").trim().toLowerCase();

    // Validación de email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return new Response(JSON.stringify({ error: "Email inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const BREVO_API_KEY = context.env.BREVO_API_KEY;
    const BREVO_LIST_ID = parseInt(context.env.BREVO_LIST_ID, 10) || 3;

    if (!BREVO_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Servicio no configurado" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        listIds: [BREVO_LIST_ID],
        updateEnabled: true,
      }),
    });

    const brevoData = await brevoResponse.json();

    if (!brevoResponse.ok) {
      // Si el contacto ya existe, Brevo devuelve "Contact already exist"
      // No es un error real — el contacto está en la lista
      if (brevoData.code === "duplicate_parameter") {
        return new Response(
          JSON.stringify({ success: true, alreadyExists: true }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: brevoData.message || "Error al suscribir",
        }),
        {
          status: brevoResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
