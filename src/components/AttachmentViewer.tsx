"use client";

import { useState, useEffect } from "react";
import { Attachment } from "@/lib/types";
import {
  FileText,
  Image as ImageIcon,
  Table2,
  Code2,
  Maximize2,
  Download,
} from "lucide-react";
import {
  getAttachmentKind,
  decodeBase64Content,
  parseCsv,
  type CsvData,
} from "@/lib/attachment-utils";
import { CsvTableView } from "./CsvTableView";
import { AttachmentPreviewModal } from "./AttachmentPreviewModal";

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

function KindIcon({ mimeType, fileName }: { mimeType: string; fileName: string }) {
  const kind = getAttachmentKind(mimeType, fileName);
  switch (kind) {
    case "csv":
      return <Table2 className="h-4 w-4 text-emerald-600" />;
    case "html":
      return <Code2 className="h-4 w-4 text-primary" />;
    case "pdf":
      return <FileText className="h-4 w-4 text-destructive/70" />;
    case "image":
      return <ImageIcon className="h-4 w-4 text-primary" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
}

function PdfBlobViewer({ content, mimeType, height }: { content: string; mimeType: string; height: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const bytes = Uint8Array.from(atob(content), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      setUrl(blobUrl);
      return () => URL.revokeObjectURL(blobUrl);
    } catch {
      setUrl(null);
    }
  }, [content, mimeType]);

  if (!url) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        <p className="text-[13px]">Unable to load PDF preview.</p>
      </div>
    );
  }

  return <iframe src={url} title="PDF preview" className={`w-full ${height}`} />;
}

function useFetchedCsv(url: string | undefined, enabled: boolean) {
  const [data, setData] = useState<CsvData | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled || !url) return;
    setLoading(true);
    fetch(url)
      .then((r) => r.text())
      .then((raw) => setData(parseCsv(raw)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [url, enabled]);

  return { data, loading };
}

function InlinePreview({ att }: { att: Attachment }) {
  const kind = getAttachmentKind(att.mimeType, att.fileName);
  const needsFetch = !att.content && !!att.url && kind === "csv";
  const { data: fetchedCsv, loading: csvLoading } = useFetchedCsv(att.url, needsFetch);

  if (att.content) {
    if (kind === "csv") {
      const raw = decodeBase64Content(att.content);
      const data = parseCsv(raw);
      return (
        <div className="max-h-[300px] overflow-auto border border-border bg-card">
          <CsvTableView data={data} />
        </div>
      );
    }
    if (kind === "html") {
      const html = decodeBase64Content(att.content);
      return (
        <div className="overflow-hidden border border-border bg-white">
          <iframe srcDoc={html} title={att.fileName} className="h-[300px] w-full border-0" sandbox="allow-same-origin" />
        </div>
      );
    }
    if (kind === "image") {
      const src = `data:${att.mimeType};base64,${att.content}`;
      return (
        <div className="overflow-hidden border border-border bg-muted/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={att.fileName} className="h-auto w-full object-contain" style={{ maxHeight: 400 }} />
        </div>
      );
    }
    if (kind === "pdf") {
      return (
        <div className="overflow-hidden border border-border bg-muted/20">
          <PdfBlobViewer content={att.content} mimeType={att.mimeType} height="h-[400px]" />
        </div>
      );
    }
  }

  if (att.url) {
    if (kind === "csv") {
      if (csvLoading) {
        return (
          <div className="flex h-[180px] items-center justify-center border border-border bg-muted/20">
            <p className="text-[13px] text-muted-foreground">Loading spreadsheet...</p>
          </div>
        );
      }
      if (fetchedCsv) {
        return (
          <div className="max-h-[300px] overflow-auto border border-border bg-card">
            <CsvTableView data={fetchedCsv} />
          </div>
        );
      }
    }
    if (kind === "html") {
      return (
        <div className="overflow-hidden border border-border bg-white">
          <iframe src={att.url} title={att.fileName} className="h-[300px] w-full border-0" />
        </div>
      );
    }
    if (kind === "pdf") {
      return (
        <div className="overflow-hidden border border-border bg-muted/20">
          <iframe src={att.url} title={att.fileName} className="h-[400px] w-full border-0" />
        </div>
      );
    }
    if (kind === "image") {
      return (
        <div className="overflow-hidden border border-border bg-muted/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={att.url} alt={att.fileName} className="h-auto w-full object-contain" style={{ maxHeight: 400 }} />
        </div>
      );
    }
  }

  return <PlaceholderPreview att={att} kind={kind} />;
}

function PlaceholderPreview({
  att,
  kind,
}: {
  att: Attachment;
  kind: string;
}) {
  return (
    <div className="overflow-hidden border border-border bg-muted/20">
      <div className="flex min-h-[180px] items-center justify-center p-8">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center border border-border bg-card">
            <KindIcon mimeType={att.mimeType} fileName={att.fileName} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-foreground/85">
              {att.fileName}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {kind.toUpperCase()} &middot; {formatFileSize(att.size)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function hasPreviewableContent(att: Attachment): boolean {
  return !!(att.content || att.url);
}

export function AttachmentViewer({
  attachments,
}: {
  attachments: Attachment[];
}) {
  const [previewAtt, setPreviewAtt] = useState<Attachment | null>(null);

  if (attachments.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center border border-dashed border-border bg-muted/20">
        <p className="text-[13px] text-muted-foreground">No attachments</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Source Attachments
      </h3>

      {attachments.map((att) => {
        const previewable = hasPreviewableContent(att);
        return (
          <div key={att.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px]">
                <KindIcon mimeType={att.mimeType} fileName={att.fileName} />
                <span className="font-medium text-foreground/85">
                  {att.fileName}
                </span>
                <span className="text-muted-foreground">
                  ({formatFileSize(att.size)})
                </span>
              </div>
              <div className="flex items-center gap-1">
                {att.url && (
                  <a
                    href={att.url}
                    download={att.fileName}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </a>
                )}
                {previewable && (
                  <button
                    onClick={() => setPreviewAtt(att)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Maximize2 className="h-3 w-3" />
                    Expand
                  </button>
                )}
              </div>
            </div>

            <div
              className={previewable ? "cursor-pointer" : ""}
              onClick={() => previewable && setPreviewAtt(att)}
            >
              <InlinePreview att={att} />
            </div>
          </div>
        );
      })}

      {previewAtt && (
        <AttachmentPreviewModal
          attachment={previewAtt}
          onClose={() => setPreviewAtt(null)}
        />
      )}
    </div>
  );
}
