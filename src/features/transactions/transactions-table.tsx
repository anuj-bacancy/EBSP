"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { TransactionRecord } from "@/types/domain";

const columns: ColumnDef<TransactionRecord>[] = [
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "merchant",
    header: "Merchant",
  },
  {
    accessorKey: "amountCents",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.original.amountCents),
  },
  {
    accessorKey: "riskScore",
    header: "Risk",
    cell: ({ row }) => `${row.original.riskScore} / ${row.original.riskAction}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export function TransactionsTable({ data }: { data: TransactionRecord[] }) {
  return <DataTable columns={columns} data={data} searchPlaceholder="Filter by merchant, rail, score..." />;
}
