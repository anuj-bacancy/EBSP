"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function WebhookReplayButton({ deliveryId, eventType }: { deliveryId: string; eventType: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={loading}
      onClick={async () => {
        setLoading(true);

        try {
          const response = await fetch("/api/v1/webhooks/replay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deliveryId }),
          });
          const payload = await response.json();
          if (!response.ok) {
            throw new Error(payload.error ?? "Unable to replay webhook");
          }
          toast.success(`${eventType} replayed with signature ${payload.signature.slice(0, 10)}...`);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Unable to replay webhook");
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Replaying..." : "Replay"}
    </Button>
  );
}
