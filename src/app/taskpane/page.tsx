"use client";

import { useEffect, useState, useCallback } from "react";
import { Hexagon, Paperclip, Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    Office?: {
      onReady: (callback: (info: { host: string }) => void) => void;
      context: {
        mailbox: {
          item: {
            from: { displayName: string; emailAddress: string };
            subject: string;
            getAttachmentsAsync: (
              callback: (result: {
                value: {
                  id: string;
                  name: string;
                  size: number;
                  contentType: string;
                }[];
              }) => void
            ) => void;
            getAttachmentContentAsync: (
              id: string,
              callback: (result: {
                value: { content: string; format: string };
              }) => void
            ) => void;
          };
        };
      };
    };
  }
}

interface AttachmentInfo {
  id: string;
  name: string;
  size: number;
  contentType: string;
}

type ViewState = "loading" | "ready" | "sending" | "success" | "error";

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

export default function TaskpanePage() {
  const [state, setState] = useState<ViewState>("loading");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js";
    script.onload = () => {
      window.Office?.onReady(() => {
        try {
          const item = window.Office!.context.mailbox.item;
          setSenderName(item.from.displayName);
          setSenderEmail(item.from.emailAddress);
          setSubject(item.subject);

          item.getAttachmentsAsync((result) => {
            const files = result.value.filter(
              (a) =>
                a.contentType.startsWith("image/") ||
                a.contentType === "application/pdf"
            );
            setAttachments(files);
            setState("ready");
          });
        } catch {
          setState("ready");
        }
      });
    };
    script.onerror = () => {
      setState("ready");
    };
    document.head.appendChild(script);
  }, []);

  const handleSend = useCallback(async () => {
    setState("sending");

    try {
      const baseUrl = window.location.origin;
      const res = await fetch(`${baseUrl}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          senderEmail,
          emailSubject: subject,
          customer: {
            id: `cust-${Date.now()}`,
            name: senderName || "Unknown Sender",
            email: senderEmail || "unknown@example.com",
            phone: "",
            company: senderEmail
              ? senderEmail.split("@")[1]?.split(".")[0] || "Unknown"
              : "Unknown",
            billingAddress: "Not provided",
            shippingAddress: "Not provided",
          },
          attachments: attachments.map((a) => ({
            id: `att-${Date.now()}-${a.id}`,
            fileName: a.name,
            mimeType: a.contentType,
            size: a.size,
            url: "/sample-handwritten-order.png",
          })),
          lineItems: [],
        }),
      });

      if (!res.ok) throw new Error("Failed to create order");

      const order = await res.json();
      setOrderId(order.id);
      setState("success");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
      setState("error");
    }
  }, [senderName, senderEmail, subject, attachments]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="border-b bg-slate-50 px-5 py-4">
        <div className="flex items-center gap-2">
          <Hexagon className="h-6 w-6 text-slate-800" />
          <span className="text-base font-bold tracking-tight text-slate-800">
            Hexa Platform
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {state === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <p className="text-sm text-slate-500">Connecting to Outlook...</p>
          </div>
        )}

        {state === "ready" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Send to Hexa Platform?
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                This will create a new order from the email attachments and send
                it for processing.
              </p>
            </div>

            {(senderName || senderEmail) && (
              <div className="rounded-lg border bg-slate-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  From
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {senderName || senderEmail}
                </p>
                {senderName && senderEmail && (
                  <p className="text-xs text-slate-500">{senderEmail}</p>
                )}
                {subject && (
                  <>
                    <p className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                      Subject
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600">{subject}</p>
                  </>
                )}
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                Detected Attachments
              </p>
              {attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2.5 rounded-lg border bg-white p-3"
                    >
                      <Paperclip className="h-4 w-4 shrink-0 text-blue-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-700">
                          {att.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatFileSize(att.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed p-4 text-center text-sm text-slate-400">
                  No PDF or image attachments detected.
                  <br />
                  Open an email with attachments to send.
                </p>
              )}
            </div>

            <button
              onClick={handleSend}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700 active:bg-slate-900"
            >
              <Send className="h-4 w-4" />
              Send to Hexa Platform
            </button>
          </div>
        )}

        {state === "sending" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <p className="text-sm text-slate-500">Creating order...</p>
          </div>
        )}

        {state === "success" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Order Created
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                The order has been sent to the Hexa Platform for processing.
              </p>
            </div>
            {orderId && (
              <a
                href={`${window.location.origin}/orders/${orderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                View in Platform
              </a>
            )}
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Something went wrong
              </h3>
              <p className="mt-1 text-sm text-slate-500">{errorMsg}</p>
            </div>
            <button
              onClick={() => setState("ready")}
              className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
