"use client";

import { Button } from "@/components/ui/button";

export function DownloadLinkButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Button asChild size="sm" variant="outline">
      <a href={href}>{label}</a>
    </Button>
  );
}
