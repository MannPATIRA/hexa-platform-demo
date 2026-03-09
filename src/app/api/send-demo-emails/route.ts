import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

const REQUIRED_VARS = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
] as const;

const DEMO_EMAIL_RECIPIENT = "supplier-hexa@outlook.com";

export async function POST() {
  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: "SMTP not configured",
        message:
          "Configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env to enable sending demo emails.",
        missingVars: missing,
      },
      { status: 503 }
    );
  }

  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT!);
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;
  const to = DEMO_EMAIL_RECIPIENT;

  const publicDir = path.join(process.cwd(), "public");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const sent: string[] = [];
  const errors: string[] = [];

  try {
    // Email 1: Formal Purchase Order (HTML)
    const htmlPath = path.join(publicDir, "sample-purchase-order.html");
    if (fs.existsSync(htmlPath)) {
      await transporter.sendMail({
        from: `"James Whitfield - Acme Distributors" <${user}>`,
        to,
        subject: "PO-2026-0341 — March Restock Order",
        text: [
          "Hi,",
          "",
          "Please find attached our purchase order PO-2026-0341 for the March restock.",
          "A few items still need price confirmation — I've noted those on the PO.",
          "",
          "Happy to jump on a call to clarify anything.",
          "",
          "Best regards,",
          "James Whitfield",
          "Purchasing Manager",
          "Acme Distributors Inc.",
          "(555) 234-8901",
        ].join("\n"),
        attachments: [
          {
            filename: "PO-2026-0341-AcmeDistributors.html",
            path: htmlPath,
            contentType: "text/html",
          },
        ],
      });
      sent.push("Purchase Order (HTML)");
    } else {
      errors.push("sample-purchase-order.html not found");
    }

    // Email 2: CSV Order Spreadsheet
    const csvPath = path.join(publicDir, "sample-order.csv");
    if (fs.existsSync(csvPath)) {
      await transporter.sendMail({
        from: `"Sarah Chen - Meridian Parts" <${user}>`,
        to,
        subject: "February Replenishment — Order Spreadsheet",
        text: [
          "Hi team,",
          "",
          "Attached is our February replenishment order as a CSV export",
          "from our inventory system. Should be straightforward — all SKUs",
          "are ones we've ordered before.",
          "",
          "Please confirm availability and expected ship dates.",
          "",
          "Thanks,",
          "Sarah Chen",
          "Procurement Lead",
          "Meridian Parts Co.",
          "(555) 876-5432",
        ].join("\n"),
        attachments: [
          {
            filename: "meridian-parts-feb-order.csv",
            path: csvPath,
            contentType: "text/csv",
          },
        ],
      });
      sent.push("CSV Spreadsheet");
    } else {
      errors.push("sample-order.csv not found");
    }

    // Email 3: Handwritten Note Photo (PNG)
    const notePath = path.join(publicDir, "handwritten-order-note.png");
    if (fs.existsSync(notePath)) {
      await transporter.sendMail({
        from: `"Marcus Rivera - Topline Hardware" <${user}>`,
        to,
        subject: "Quick order note from our warehouse",
        text: [
          "Hi,",
          "",
          "Here's a photo of the handwritten note from our warehouse team.",
          "A few of the SKUs are hard to read so we might need to confirm those.",
          "",
          "Can you check availability on the valve assemblies and pump impellers?",
          "",
          "Thanks,",
          "Marcus Rivera",
          "Topline Hardware LLC",
          "(555) 321-0987",
        ].join("\n"),
        attachments: [
          {
            filename: "warehouse-order-note.png",
            path: notePath,
            contentType: "image/png",
          },
        ],
      });
      sent.push("Handwritten Note");
    } else {
      errors.push("handwritten-order-note.png not found");
    }

    if (sent.length === 0) {
      return NextResponse.json(
        {
          error: "No emails sent",
          message: "Attachment files not found in public folder.",
          errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sent.length} demo email(s) to ${to}`,
      sent,
      ...(errors.length > 0 && { warnings: errors }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send emails";
    return NextResponse.json(
      {
        error: "Send failed",
        message,
      },
      { status: 500 }
    );
  }
}
