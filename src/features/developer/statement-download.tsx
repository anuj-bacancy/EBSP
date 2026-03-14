"use client";

import { saveAsTextFile } from "@/hooks/save-as-text-file";
import { Button } from "@/components/ui/button";

export function StatementDownloadButton({
  filename,
  content,
}: {
  filename: string;
  content: string;
}) {
  return (
    <Button size="sm" variant="outline" onClick={() => saveAsTextFile(filename, content)}>
      Download
    </Button>
  );
}
