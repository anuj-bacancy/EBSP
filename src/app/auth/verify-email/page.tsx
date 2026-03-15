import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Verify your email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              We created your account successfully. Please verify your email to continue.
            </p>
            {email ? (
              <p className="rounded-2xl border border-[var(--border)] bg-black/10 px-4 py-3 text-sm">
                Confirmation link sent to <span className="font-medium">{email}</span>
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/sign-in">Go to sign in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/sign-up">Use another email</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
