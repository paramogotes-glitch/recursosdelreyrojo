#!/bin/bash
# Recrea la plantilla DOI #5 en Brevo con codificación UTF-8 correcta
set -e

API_KEY=$(head -1 .env | sed 's/BREVO_API_KEY=//')

# 1. Eliminar la plantilla corrupta
echo "=== Eliminando plantilla #5 ==="
curl -s -w "HTTP %{http_code}" -X DELETE \
  -H "api-key: $API_KEY" \
  "https://api.brevo.com/v3/smtp/templates/5"
echo ""

# 2. Crear plantilla nueva con contenido limpio
echo "=== Creando plantilla nueva ==="
curl -s -w "\nHTTP %{http_code}" -X POST \
  -H "api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
  "name": "DOI - Confirmación El Edicto Real",
  "subject": "Confirma tu suscripción.",
  "htmlContent": "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n</head>\n<body style=\"background:#1a1a1a;color:#f0f0f0;font-family:Georgia,serif;padding:20px;\">\n<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:560px;margin:0 auto;\">\n<tr><td style=\"padding:30px 20px;\">\n\n<p style=\"font-size:18px;line-height:1.6;margin:0 0 16px;\">¡Ojo! Que no te pase como al despistado de la corte que se perdió el festín por no leer la invitación...</p>\n\n<p style=\"font-size:16px;line-height:1.6;margin:0 0 16px;\">Esto es rápido, pero crucial. Para que <strong>\"El Edicto Real\"</strong> aterrice sin problemas en tu bandeja de entrada y no termine en el rincón olvidado de los \"Spam\", <strong>necesito que confirmes tu suscripción pulsando el botón de abajo para activarla.</strong></p>\n\n<table cellpadding=\"0\" cellspacing=\"0\" style=\"margin:24px 0;\"><tr>\n<td align=\"center\" style=\"background:#c32429;border-radius:8px;padding:16px 32px;\">\n<a href=\"{{ doubleoptin }}\" target=\"_blank\" style=\"color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;font-family:Arial,sans-serif;\">QUIERO Y CONFIRMO MI SUSCRIPCIÓN</a>\n</td>\n</tr></table>\n\n<p style=\"font-size:16px;line-height:1.6;margin:0 0 16px;\">Si no confirmas, es como si hubieras llegado a la puerta del castillo y te dieras media vuelta. Y créeme, te perderías el Banquete Real.</p>\n\n<p style=\"font-size:16px;line-height:1.6;margin:0 0 16px;\">Así que no te lo pienses. Un clic y estás dentro.</p>\n\n<p style=\"font-size:16px;line-height:1.6;margin:0 0 24px;\">Mientras tanto, te dejo con una reflexión:</p>\n\n<p style=\"font-size:16px;line-height:1.6;margin:0 0 24px;font-style:italic;\">¿Cuántas veces has dejado pasar una oportunidad por no dar un pequeño paso?</p>\n\n<p style=\"font-size:16px;line-height:1.6;margin:0 0 4px;\">Te veo dentro,</p>\n<p style=\"font-size:16px;line-height:1.6;margin:0;\"><strong>Rey</strong></p>\n\n</td></tr>\n</table>\n</body>\n</html>",
  "tag": "optin"
}' \
  "https://api.brevo.com/v3/smtp/templates"
echo ""
echo "=== Hecho ==="
