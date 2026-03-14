"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/ui/badge";
import type { KycCase } from "@/types/domain";

const columns: ColumnDef<KycCase>[] = [
  { accessorKey: "id", header: "Case ID" },
  { accessorKey: "providerDecision", header: "Provider" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "reasons",
    header: "Reasons",
    cell: ({ row }) => row.original.reasons.join(", "),
  },
];

export function KycTable({ data }: { data: KycCase[] }) {
  return <DataTable columns={columns} data={data} searchPlaceholder="Search KYC case, decision, or reason..." />;
}
