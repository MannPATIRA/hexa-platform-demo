/**
 * Notification integration stubs.
 * These functions log to console and can be swapped with real
 * integrations (SendGrid, SES, Twilio) later.
 */

export async function sendEmail(to: string, subject: string, body: string) {
  console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
  console.log(`[EMAIL] Body:\n${body}`);
  // Swap with SendGrid / SES later
}

export async function sendWhatsApp(to: string, message: string) {
  console.log(`[WHATSAPP] To: ${to} | Message: ${message}`);
  // Swap with Twilio later
}
