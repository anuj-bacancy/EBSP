"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { EndUser } from "@/types/domain";

export function KycDocumentUpload({
  partnerId,
  endUsers,
}: {
  partnerId: string;
  endUsers: EndUser[];
}) {
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(endUsers[0]?.id ?? "");
  const [documentType, setDocumentType] = useState("drivers_license");
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--panel)] p-6">
      <h3 className="text-lg font-semibold">Upload KYC document</h3>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Documents are stored in the Supabase `kyc-documents` bucket and linked to the selected end user.
      </p>
      <form
        className="mt-5 grid gap-4 md:grid-cols-3"
        onSubmit={async (event) => {
          event.preventDefault();

          if (!file || !selectedUserId) {
            toast.error("Select an end user and file first.");
            return;
          }

          const body = new FormData();
          body.set("partnerId", partnerId);
          body.set("endUserId", selectedUserId);
          body.set("documentType", documentType);
          body.set("file", file);

          setLoading(true);

          try {
            const response = await fetch("/api/v1/kyc/documents", {
              method: "POST",
              body,
            });
            const payload = await response.json();

            if (!response.ok) {
              throw new Error(payload.error ?? "Upload failed");
            }

            toast.success(`Document stored at ${payload.document.storage_path}`);
            setFile(null);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Upload failed");
          } finally {
            setLoading(false);
          }
        }}
      >
        <div>
          <Label htmlFor="endUserId">End user</Label>
          <Select id="endUserId" value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
            {endUsers.map((endUser) => (
              <option key={endUser.id} value={endUser.id}>
                {endUser.legalName}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="documentType">Document type</Label>
          <Select id="documentType" value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
            <option value="drivers_license">Driver&apos;s license</option>
            <option value="passport">Passport</option>
            <option value="utility_bill">Utility bill</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="file">File</Label>
          <Input
            id="file"
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </div>
        <div className="md:col-span-3">
          <Button disabled={loading} type="submit">
            {loading ? "Uploading..." : "Upload document"}
          </Button>
        </div>
      </form>
    </div>
  );
}
