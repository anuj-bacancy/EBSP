import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignUpForm } from "@/features/auth/sign-up-form";
import { getAppSession } from "@/lib/auth/session";

export default async function SignUpPage() {
  const session = await getAppSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Create a sandbox workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <SignUpForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
