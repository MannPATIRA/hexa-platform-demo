"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  ExternalLink,
  Shield,
} from "lucide-react";
import type { IntegrationProvider } from "@/data/integrations-data";

interface ConnectionSetupTabProps {
  provider: IntegrationProvider;
}

export default function ConnectionSetupTab({ provider }: ConnectionSetupTabProps) {
  const [prerequisitesOpen, setPrerequisitesOpen] = useState(true);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "failed">("idle");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const handleTest = () => {
    setTestStatus("testing");
    setTimeout(() => {
      setTestStatus(provider.status === "error" ? "failed" : "success");
    }, 1800);
  };

  const isConnected = provider.status === "connected";
  const hasCredentials = provider.credentialFields.length > 0;

  if (!hasCredentials) {
    return (
      <div className="space-y-4 p-1">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <p className="text-[13px] font-medium text-emerald-800">
              No configuration needed
            </p>
          </div>
          <p className="mt-1 text-[12px] text-emerald-700">
            This feature is available by default. Use the Data & Sync tab to configure import/export options.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-1">
      {/* Prerequisites */}
      {provider.prerequisites.length > 0 && (
        <div className="rounded-lg border">
          <button
            onClick={() => setPrerequisitesOpen(!prerequisitesOpen)}
            className="flex w-full items-center gap-2 px-4 py-3 text-left"
          >
            {prerequisitesOpen ? (
              <ChevronDown size={14} className="text-muted-foreground" />
            ) : (
              <ChevronRight size={14} className="text-muted-foreground" />
            )}
            <span className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
              Prerequisites
            </span>
          </button>
          {prerequisitesOpen && (
            <div className="border-t px-4 pb-4 pt-3">
              <ul className="space-y-2">
                {provider.prerequisites.map((prereq, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border border-muted-foreground/30" />
                    <span className="text-[12px] text-muted-foreground">{prereq}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center gap-1.5">
                <ExternalLink size={12} className="text-primary" />
                <span className="text-[11px] font-medium text-primary cursor-pointer hover:underline">
                  View {provider.shortName} setup documentation
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Credentials Form */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield size={14} className="text-muted-foreground" />
          <h3 className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
            Credentials
          </h3>
        </div>
        <div className="space-y-3">
          {provider.credentialFields.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-[12px] font-medium text-foreground">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              {field.type === "select" ? (
                <Select
                  value={formValues[field.key] || ""}
                  onValueChange={(val) =>
                    setFormValues((prev) => ({ ...prev, [field.key]: val }))
                  }
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-[13px]">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.type === "password" ? "password" : "text"}
                  placeholder={field.placeholder || ""}
                  value={formValues[field.key] || (isConnected ? "••••••••" : "")}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  className="h-9 text-[13px]"
                />
              )}
            </div>
          ))}
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">
          Authentication: {provider.authMethod}
        </p>
      </div>

      <Separator />

      {/* Test Connection */}
      <div>
        <h3 className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Test Connection
        </h3>

        <Button
          onClick={handleTest}
          disabled={testStatus === "testing"}
          variant="outline"
          className="h-9 text-[13px]"
        >
          {testStatus === "testing" && <Loader2 size={14} className="mr-2 animate-spin" />}
          {testStatus === "testing" ? "Testing..." : "Test Connection"}
        </Button>

        {testStatus === "success" && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50/50 p-3">
            <CheckCircle2 size={15} className="mt-0.5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-[12px] font-medium text-emerald-800">Connection verified</p>
              <p className="text-[11px] text-emerald-700">
                Response time: 247ms &middot; API version detected: v2.1
              </p>
            </div>
          </div>
        )}

        {testStatus === "failed" && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50/50 p-3">
            <XCircle size={15} className="mt-0.5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-[12px] font-medium text-red-800">Connection failed</p>
              <p className="text-[11px] text-red-700">
                {provider.status === "error"
                  ? "OAuth token expired. Please re-authenticate to refresh your connection."
                  : "Unable to reach the server. Verify credentials and network access."}
              </p>
              <p className="mt-1.5 text-[11px] font-medium text-red-700 cursor-pointer hover:underline">
                View troubleshooting guide
              </p>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Save & Activate */}
      <div className="flex items-center gap-3">
        <Button className={cn("h-9 text-[13px]", isConnected && "bg-emerald-600 hover:bg-emerald-700")}>
          {isConnected ? "Update Credentials" : "Save & Activate"}
        </Button>
        {isConnected && (
          <span className="text-[11px] text-emerald-600 font-medium">
            Connected since {provider.connectedSince}
          </span>
        )}
      </div>
    </div>
  );
}
