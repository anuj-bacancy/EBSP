import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Reset password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ForgotPasswordForm />
            <Link className="text-sm font-semibold text-[var(--brand-400)]" href="/sign-in">
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
