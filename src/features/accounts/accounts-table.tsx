"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, titleCase } from "@/lib/utils";
import type { Account } from "@/types/domain";

const columns: ColumnDef<Account>[] = [
  {
    accessorKey: "nickname",
    header: "Account",
    cell: ({ row }) => (
      <Link className="font-medium text-[var(--foreground)] underline-offset-4 hover:underline" href={`/accounts/${row.original.id}`}>
        {row.original.nickname}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => titleCase(row.original.type),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "balances.available",
    header: "Available",
    cell: ({ row }) => formatCurrency(row.original.balances.available),
  },
  {
    accessorKey: "balances.ledger",
    header: "Ledger",
    cell: ({ row }) => formatCurrency(row.original.balances.ledger),
  },
];

export function AccountsTable({ data }: { data: Account[] }) {
  return <DataTable columns={columns} data={data} searchPlaceholder="Search accounts, owners, status..." />;
}
