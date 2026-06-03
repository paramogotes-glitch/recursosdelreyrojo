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

  // === Llamada a Brevo ===
  let brevoResponse;
  try {
    brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
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
  } catch (_fetchErr) {
    return new Response(JSON.stringify({ error: "No se pudo conectar con Brevo" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // === Parsear respuesta de Brevo ===
  let brevoData;
  try {
    brevoData = await brevoResponse.json();
  } catch (_jsonErr) {
    return new Response(
      JSON.stringify({
        error: `Brevo respondió con estado ${brevoResponse.status} pero sin JSON válido`,
      }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // === Manejar respuesta ===
  if (!brevoResponse.ok) {
    // Contacto ya existe — no es error real
    if (brevoData.code === "duplicate_parameter") {
      return new Response(
        JSON.stringify({ success: true, alreadyExists: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Otro error de Brevo
    return new Response(
      JSON.stringify({
        error: brevoData.message || `Error de Brevo (${brevoResponse.status})`,
      }),
      {
        status: brevoResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // === Enviar email de doble opt-in (template #5) ===
  const DOI_TEMPLATE_ID = 5; // "Plantilla de Confirmación de doble opt-in para el Edicto Real"
  const CONFIRMATION_URL = "https://recursosdelreyrojo.com/dentro";

  try {
    const doiResponse = await fetch(
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
        }),
      }
    );

    if (!doiResponse.ok) {
      const doiError = await doiResponse.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          success: true,
          warning: `Contacto creado pero el email de confirmación falló: ${doiError.message || doiResponse.status}`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (_doiErr) {
    return new Response(
      JSON.stringify({
        success: true,
        warning: "Contacto creado pero el email de confirmación no se pudo enviar",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Éxito completo: contacto creado + email de confirmación enviado
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
