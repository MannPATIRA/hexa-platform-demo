import { NextRequest, NextResponse } from "next/server";

interface RFQPayload {
  rfqRef: string;
  itemName: string;
  itemSku: string;
  itemDescription: string;
  technicalSpecs?: Record<string, string | undefined>;
  attachments: { fileName: string }[];
  supplierName: string;
  supplierEmail: string;
  quantity: number;
  unitPrice: number;
  deliveryDate: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface GraphMeResponse {
  mail?: string | null;
  userPrincipalName?: string | null;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function buildHtmlBody(p: RFQPayload): string {
  const total = p.unitPrice * p.quantity;
  const specsRows = p.technicalSpecs
    ? Object.entries(p.technicalSpecs)
        .filter(([, v]) => v)
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 8px;color:#6b7280;text-transform:capitalize">${k}</td><td style="padding:4px 8px;color:#111">${v}</td></tr>`
        )
        .join("")
    : "";

  const attachmentsList =
    p.attachments.length > 0
      ? `<p style="margin:12px 0 4px;color:#374151;font-weight:600">Attachments:</p>
         <ul style="margin:0;padding-left:20px;color:#6b7280">
           ${p.attachments.map((a) => `<li>${a.fileName}</li>`).join("")}
         </ul>`
      : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;color:#374151;max-width:680px;margin:0 auto;padding:24px">
  <p style="margin:0 0 16px">Dear ${p.supplierName} Team,</p>

  <p style="margin:0 0 16px">
    We are requesting a quotation for the following item. Please review the details below and provide your best pricing and lead time.
  </p>

  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:12px">
    <thead>
      <tr style="background:#f3f4f6">
        <th style="padding:8px;text-align:left;border:1px solid #e5e7eb;color:#6b7280;font-weight:600">Item</th>
        <th style="padding:8px;text-align:left;border:1px solid #e5e7eb;color:#6b7280;font-weight:600">SKU</th>
        <th style="padding:8px;text-align:right;border:1px solid #e5e7eb;color:#6b7280;font-weight:600">Qty</th>
        <th style="padding:8px;text-align:right;border:1px solid #e5e7eb;color:#6b7280;font-weight:600">Est. Unit Price</th>
        <th style="padding:8px;text-align:right;border:1px solid #e5e7eb;color:#6b7280;font-weight:600">Est. Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:8px;border:1px solid #e5e7eb">${p.itemName}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;font-family:monospace;color:#6b7280">${p.itemSku}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:right">${p.quantity.toLocaleString()}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:right">$${fmt(p.unitPrice)}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;font-weight:600">$${fmt(total)}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr style="background:#f9fafb">
        <td colspan="4" style="padding:8px;border:1px solid #e5e7eb;text-align:right;font-weight:600">Estimated Total</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;font-weight:700">$${fmt(total)}</td>
      </tr>
    </tfoot>
  </table>

  ${
    specsRows
      ? `<p style="margin:12px 0 4px;color:#374151;font-weight:600">Technical Specifications:</p>
         <table style="font-size:12px;border-collapse:collapse">${specsRows}</table>`
      : ""
  }

  ${attachmentsList}

  <p style="margin:16px 0 4px">Requested delivery date: <strong>${formatDisplayDate(p.deliveryDate)}</strong></p>
  <p style="margin:4px 0">Payment terms: <strong>Net 30</strong></p>
  <p style="margin:4px 0">Delivery address: <span style="color:#374151">1500 Factory Lane, Dock 4, Milwaukee, WI 53201</span></p>
  <p style="margin:16px 0 4px;color:#6b7280;font-size:12px">This RFQ is valid for 14 days from the date of issue.</p>

  <p style="margin:20px 0 0">Best regards,<br />
    <strong>Hexa Procurement Team</strong><br />
    <span style="color:#6b7280">procurement@hexamfg.com</span>
  </p>
</body>
</html>`;
}

async function getGraphAccessToken() {
  const clientId = process.env.MS_GRAPH_CLIENT_ID;
  const clientSecret = process.env.MS_GRAPH_CLIENT_SECRET;
  const refreshToken = process.env.MS_GRAPH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Microsoft Graph not configured. Set MS_GRAPH_CLIENT_ID, MS_GRAPH_CLIENT_SECRET, and MS_GRAPH_REFRESH_TOKEN in .env."
    );
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: "https://graph.microsoft.com/Mail.Send offline_access",
  });

  const tokenRes = await fetch("https://login.microsoftonline.com/consumers/oauth2/v2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });

  if (!tokenRes.ok) {
    const raw = await tokenRes.text();
    throw new Error(`Failed to get Microsoft access token: ${raw}`);
  }

  const tokenJson = (await tokenRes.json()) as TokenResponse;
  return tokenJson.access_token;
}

export async function POST(req: NextRequest) {
  const email = process.env.PROCUREMENT_EMAIL;
  const overrideRecipient = process.env.PROCUREMENT_OVERRIDE_RECIPIENT?.trim();
  const defaultRecipient = "mann.patira@gmail.com";

  if (!email) {
    return NextResponse.json(
      {
        error: "Email not configured",
        message:
          "Set PROCUREMENT_EMAIL in .env to define which Microsoft mailbox sends RFQs.",
      },
      { status: 503 }
    );
  }

  let payload: RFQPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { rfqRef, itemName, supplierName, supplierEmail } = payload;
  if (!rfqRef || !itemName || !supplierEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const recipientEmail = overrideRecipient || defaultRecipient || supplierEmail;

  try {
    const accessToken = await getGraphAccessToken();
    const meRes = await fetch("https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!meRes.ok) {
      const raw = await meRes.text();
      throw new Error(`Graph /me failed: ${raw}`);
    }
    const me = (await meRes.json()) as GraphMeResponse;
    const sender = (me.mail || me.userPrincipalName || "").toLowerCase();
    if (sender && sender !== email.toLowerCase()) {
      throw new Error(
        `Token account mismatch: token is for ${sender} but PROCUREMENT_EMAIL is ${email}. Update env values to the same account.`
      );
    }

    const graphRes = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: `${rfqRef} — ${itemName}`,
          body: {
            contentType: "HTML",
            content: buildHtmlBody(payload),
          },
          toRecipients: [
            {
              emailAddress: {
                address: recipientEmail,
              },
            },
          ],
        },
        // Required so the message appears in the sender mailbox's Sent Items.
        saveToSentItems: true,
      }),
      cache: "no-store",
    });

    if (!graphRes.ok) {
      const raw = await graphRes.text();
      throw new Error(`Graph sendMail failed: ${raw}`);
    }

    return NextResponse.json({
      success: true,
      message: `RFQ ${rfqRef} sent to ${recipientEmail} from ${email}`,
      rfqRef,
      to: recipientEmail,
      supplierEmail,
      ...(overrideRecipient ? { overrideRecipient } : {}),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: "Send failed", message }, { status: 500 });
  }
}
