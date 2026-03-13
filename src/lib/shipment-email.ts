import nodemailer from "nodemailer";
import { Shipment } from "@/lib/types";

function prettyStatus(status: Shipment["status"]): string {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(date?: string): string {
  if (!date) return "TBD";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildHtml(shipment: Shipment): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;color:#374151;max-width:700px;margin:0 auto;padding:20px">
  <h2 style="margin:0 0 12px;color:#111827">Your order is on the move</h2>
  <p style="margin:0 0 14px">Hello ${shipment.customerName},</p>
  <p style="margin:0 0 14px">
    We have an update for <strong>${shipment.orderNumber}</strong>.
  </p>
  <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb">
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;color:#6b7280">Status</td>
      <td style="padding:8px;border:1px solid #e5e7eb;color:#111827;font-weight:600">${prettyStatus(shipment.status)}</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;color:#6b7280">Carrier</td>
      <td style="padding:8px;border:1px solid #e5e7eb;color:#111827">${shipment.carrier.toUpperCase()}</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;color:#6b7280">Tracking #</td>
      <td style="padding:8px;border:1px solid #e5e7eb;color:#111827;font-family:monospace">${shipment.trackingNumber ?? "Pending assignment"}</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;color:#6b7280">Expected Delivery</td>
      <td style="padding:8px;border:1px solid #e5e7eb;color:#111827">${formatDate(shipment.estimatedDelivery)}</td>
    </tr>
  </table>
  ${
    shipment.trackingUrl
      ? `<p style="margin:14px 0"><a href="${shipment.trackingUrl}" style="color:#2563eb;text-decoration:none">Track your package</a></p>`
      : ""
  }
  <p style="margin:14px 0 0;color:#6b7280">
    If tracking does not update within 24 hours, contact support at support@hexa-demo.com.
  </p>
</body>
</html>`;
}

function buildText(shipment: Shipment): string {
  return [
    `Order update for ${shipment.orderNumber}`,
    `Status: ${prettyStatus(shipment.status)}`,
    `Carrier: ${shipment.carrier.toUpperCase()}`,
    `Tracking #: ${shipment.trackingNumber ?? "Pending assignment"}`,
    `Expected delivery: ${formatDate(shipment.estimatedDelivery)}`,
    shipment.trackingUrl ? `Track here: ${shipment.trackingUrl}` : "",
    "If tracking does not update within 24 hours, contact support@hexa-demo.com.",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendShipmentEmail(shipment: Shipment): Promise<void> {
  const email = process.env.PROCUREMENT_EMAIL;
  const pass = process.env.PROCUREMENT_EMAIL_PASS;

  if (!email || !pass) {
    throw new Error(
      "Email not configured. Set PROCUREMENT_EMAIL and PROCUREMENT_EMAIL_PASS."
    );
  }

  if (!shipment.customerEmail) {
    throw new Error("Shipment customer email is required for notifications.");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user: email, pass },
  });

  await transporter.sendMail({
    from: `"Hexa Logistics" <${email}>`,
    to: shipment.customerEmail,
    subject: `${shipment.orderNumber}: ${prettyStatus(shipment.status)}`,
    text: buildText(shipment),
    html: buildHtml(shipment),
  });
}
