"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/ui/badge";
import type { Card } from "@/types/domain";

const columns: ColumnDef<Card>[] = [
  {
    accessorKey: "maskedPan",
    header: "Card",
    cell: ({ row }) => (
      <Link className="font-medium underline-offset-4 hover:underline" href={`/cards/${row.original.id}`}>
        {row.original.maskedPan}
      </Link>
    ),
  },
  { accessorKey: "cardholderName", header: "Cardholder" },
  { accessorKey: "network", header: "Network" },
  { accessorKey: "expiry", header: "Expiry" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export function CardsTable({ data }: { data: Card[] }) {
  return <DataTable columns={columns} data={data} searchPlaceholder="Search by last four, name, or network..." />;
}
