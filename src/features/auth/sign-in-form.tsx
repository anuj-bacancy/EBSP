"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction } from "@/lib/auth/actions";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

const initialState = { success: true, message: "" };

export function SignInForm({ defaultEmail }: { defaultEmail?: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: defaultEmail ?? "",
      password: "",
    },
  });

  useEffect(() => {
    if (!state.success && state.message) {
      toast.error(state.message);
    }
    if (state.success && state.message) {
      toast.success(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" {...form.register("email")} />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...form.register("password")} />
      </div>
      <Button className="w-full" type="submit" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-sm text-[var(--muted-foreground)]">
        Sign in with your Supabase Auth account. Workspace access is derived from your profile and partner membership rows.
      </p>
    </form>
  );
}
