import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoIdentities } from "@/features/auth/demo-identities";
import { SignInForm } from "@/features/auth/sign-in-form";
import { getAppSession } from "@/lib/auth/session";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ email_confirmed?: string }>;
}) {
  const params = await searchParams;
  const session = await getAppSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Sign in to Northstar</CardTitle>
          </CardHeader>
          <CardContent>
            {params.email_confirmed === "1" ? (
              <p className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                Email verified successfully. You can sign in now.
              </p>
            ) : null}
            <SignInForm />
          </CardContent>
        </Card>
        <DemoIdentities />
      </main>
    </div>
  );
}
