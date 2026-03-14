import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoIdentities } from "@/features/auth/demo-identities";
import { SignInForm } from "@/features/auth/sign-in-form";
import { getAppSession } from "@/lib/auth/session";

export default async function SignInPage() {
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
            <SignInForm />
          </CardContent>
        </Card>
        <DemoIdentities />
      </main>
    </div>
  );
}
