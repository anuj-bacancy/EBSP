"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, titleCase } from "@/lib/utils";
import type { Transfer } from "@/types/domain";

const columns: ColumnDef<Transfer>[] = [
  { accessorKey: "id", header: "Transfer ID" },
  {
    accessorKey: "direction",
    header: "Direction",
    cell: ({ row }) => titleCase(row.original.direction),
  },
  {
    accessorKey: "speed",
    header: "Speed",
    cell: ({ row }) => titleCase(row.original.speed),
  },
  {
    accessorKey: "amountCents",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.original.amountCents),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export function TransfersTable({ data }: { data: Transfer[] }) {
  return <DataTable columns={columns} data={data} searchPlaceholder="Search by transfer ID or return code..." />;
}
