"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Send,
  Upload,
  ChevronDown,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RequestCategory, RequestUrgency } from "@/lib/procurement-types";

const categoryLabels: Record<RequestCategory, string> = {
  raw_material: "Raw Material",
  standard_component: "Standard Component",
  custom_part: "Custom Part",
  tooling: "Tooling",
  consumable: "Consumable",
  other: "Other",
};

const categoryOptions: RequestCategory[] = [
  "raw_material",
  "standard_component",
  "custom_part",
  "tooling",
  "consumable",
  "other",
];

const urgencyLabels: Record<RequestUrgency, string> = {
  routine: "Routine",
  urgent: "Urgent",
  critical: "Critical",
};

const urgencyOptions: RequestUrgency[] = ["routine", "urgent", "critical"];

const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".dxf", ".step", ".dwg", ".iges"];

interface AttachedFile {
  id: string;
  name: string;
  size: number;
}

export default function EngineeringRequestForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<RequestCategory>("raw_material");
  const [quantity, setQuantity] = useState<number | "">("");
  const [urgency, setUrgency] = useState<RequestUrgency>("routine");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const [specs, setSpecs] = useState({
    material: "",
    dimensions: "",
    tolerances: "",
    grade: "",
    finish: "",
    compliance: "",
  });

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const handleClose = useCallback(() => {
    setMounted(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  }

  function addFiles(incoming: File[]) {
    const newFiles: AttachedFile[] = incoming.map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function handleSubmit() {
    setSubmitted(true);
    setTimeout(handleClose, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-200",
          mounted ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      <div
        className={cn(
          "relative z-10 mt-[5vh] flex max-h-[90vh] w-full max-w-2xl flex-col border border-border bg-background shadow-2xl transition-all duration-200",
          mounted
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-4 scale-[0.98] opacity-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-purple-500/10">
              <Send className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                New Engineering Request
              </h2>
              <p className="text-xs text-muted-foreground">
                Submit a procurement request for engineering materials
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {submitted ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
            <div className="flex h-14 w-14 items-center justify-center bg-emerald-500/10">
              <CheckCircle className="h-7 w-7 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-foreground">
                Request Submitted
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your engineering request has been submitted for review.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Item Description
                  </label>
                  <Input
                    className="rounded-none"
                    placeholder="Describe the item you need procured..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) =>
                          setCategory(e.target.value as RequestCategory)
                        }
                        className="h-9 w-full appearance-none border border-input bg-background px-3 pr-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>
                            {categoryLabels[cat]}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Quantity Needed
                    </label>
                    <Input
                      type="number"
                      className="rounded-none"
                      placeholder="0"
                      min={1}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Urgency
                    </label>
                    <div className="relative">
                      <select
                        value={urgency}
                        onChange={(e) =>
                          setUrgency(e.target.value as RequestUrgency)
                        }
                        className="h-9 w-full appearance-none border border-input bg-background px-3 pr-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        {urgencyOptions.map((u) => (
                          <option key={u} value={u}>
                            {urgencyLabels[u]}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-5">
                  <label className="text-sm font-medium text-foreground">
                    Technical Specifications
                  </label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    All fields are optional
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {(
                      [
                        { key: "material", label: "Material", placeholder: "e.g. 6061-T6 Aluminum" },
                        { key: "dimensions", label: "Dimensions", placeholder: "e.g. 240mm x 85mm x 45mm" },
                        { key: "tolerances", label: "Tolerances", placeholder: "e.g. ±0.05mm" },
                        { key: "grade", label: "Grade", placeholder: "e.g. ASTM A193 Grade B7" },
                        { key: "finish", label: "Finish", placeholder: "e.g. Clear anodize, Type II" },
                        { key: "compliance", label: "Compliance Standards", placeholder: "e.g. ISO 2768-mK" },
                      ] as const
                    ).map(({ key, label, placeholder }) => (
                      <div key={key} className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          {label}
                        </label>
                        <Input
                          className="rounded-none"
                          placeholder={placeholder}
                          value={specs[key]}
                          onChange={(e) =>
                            setSpecs((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-5">
                  <label className="text-sm font-medium text-foreground">
                    Attachments
                  </label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    PDF, PNG, JPG, DXF, STEP, DWG, IGES
                  </p>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "mt-2 flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed px-4 py-6 transition-colors",
                      dragOver
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/40"
                    )}
                  >
                    <Upload
                      className={cn(
                        "h-5 w-5",
                        dragOver
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                    <div className="text-center">
                      <p className="text-sm text-foreground">
                        Drop files here or{" "}
                        <span className="font-medium text-primary">
                          browse
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Max 25 MB per file
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={ACCEPTED_EXTENSIONS.join(",")}
                      onChange={(e) => {
                        if (e.target.files) addFiles(Array.from(e.target.files));
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between border border-border px-3 py-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate text-sm text-foreground">
                              {file.name}
                            </span>
                            <Badge
                              variant="outline"
                              className="shrink-0 text-[10px]"
                            >
                              {formatFileSize(file.size)}
                            </Badge>
                          </div>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="ml-2 shrink-0 p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-5">
                  <label className="text-sm font-medium text-foreground">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional context, timeline constraints, alternative materials..."
                    rows={3}
                    className="mt-1.5 w-full resize-none border border-input bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!description.trim()}>
                <Send className="h-4 w-4" />
                Submit Request
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
