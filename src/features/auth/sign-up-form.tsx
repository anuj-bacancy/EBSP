"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction } from "@/lib/auth/actions";

const schema = z.object({
  fullName: z.string().min(2),
  company: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

const initialState = { success: true, message: "" };

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      company: "",
      email: "",
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
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" {...form.register("fullName")} />
      </div>
      <div>
        <Label htmlFor="company">Company</Label>
        <Input id="company" {...form.register("company")} />
      </div>
      <div>
        <Label htmlFor="email">Work email</Label>
        <Input id="email" {...form.register("email")} />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...form.register("password")} />
      </div>
      <Button className="w-full" type="submit" disabled={pending}>
        {pending ? "Provisioning..." : "Create sandbox workspace"}
      </Button>
      <p className="text-sm text-[var(--muted-foreground)]">
        Sign up creates a Supabase Auth user, a profile, a sandbox partner workspace, and the initial membership plus billing records.
      </p>
    </form>
  );
}
