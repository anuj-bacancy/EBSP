import { formatDistanceToNowStrict } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import type { TransactionRecord } from "@/types/domain";

export function RecentActivity({ transactions }: { transactions: TransactionRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.slice(0, 4).map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-black/10 px-4 py-3">
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {transaction.merchant} • {formatDistanceToNowStrict(new Date(transaction.createdAt), { addSuffix: true })}
              </p>
            </div>
            <StatusBadge status={transaction.status} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
