"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/ui/badge";
import type { ComplianceCase, FraudAlert, NotificationRecord } from "@/types/domain";

const complianceColumns: ColumnDef<ComplianceCase>[] = [
  { accessorKey: "subject", header: "Subject" },
  { accessorKey: "type", header: "Type" },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => <StatusBadge status={row.original.severity} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export function ComplianceTable({ data }: { data: ComplianceCase[] }) {
  return <DataTable columns={complianceColumns} data={data} searchPlaceholder="Search AML, OFAC, SAR, CTR..." />;
}

const fraudColumns: ColumnDef<FraudAlert>[] = [
  { accessorKey: "summary", header: "Alert" },
  { accessorKey: "score", header: "Score" },
  { accessorKey: "action", header: "Action" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export function FraudTable({ data }: { data: FraudAlert[] }) {
  return <DataTable columns={fraudColumns} data={data} searchPlaceholder="Search score, action, or summary..." />;
}

const notificationColumns: ColumnDef<NotificationRecord>[] = [
  { accessorKey: "title", header: "Notification" },
  { accessorKey: "type", header: "Event" },
  {
    accessorKey: "read",
    header: "State",
    cell: ({ row }) => <StatusBadge status={row.original.read ? "read" : "unread"} />,
  },
];

export function NotificationsTable({ data }: { data: NotificationRecord[] }) {
  return <DataTable columns={notificationColumns} data={data} searchPlaceholder="Search notifications..." />;
}
