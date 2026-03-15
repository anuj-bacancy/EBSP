"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Account, Beneficiary, EndUser, Partner } from "@/types/domain";

const accountSchema = z.object({
  partnerId: z.string().min(1),
  endUserId: z.string().min(1),
  type: z.enum(["checking", "savings", "business_checking"]),
  nickname: z.string().min(2),
});

const transferSchema = z.object({
  accountId: z.string().min(1),
  beneficiaryId: z.string().min(1),
  amountCents: z.coerce.number().min(100),
  direction: z.enum(["credit", "debit"]),
  speed: z.enum(["same_day", "next_day"]),
  idempotencyKey: z.string().min(6),
});

const cardSchema = z.object({
  partnerId: z.string().min(1),
  accountId: z.string().min(1),
  cardholderName: z.string().min(2),
  dailyLimitCents: z.coerce.number().min(1000),
});

async function postJson(path: string, payload: unknown) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const partnerId =
    typeof payload === "object" && payload && "partnerId" in payload && typeof payload.partnerId === "string" ? payload.partnerId : undefined;

  if (partnerId) {
    headers["x-partner-id"] = partnerId;
  }

  const response = await fetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Request failed");
  }

  return response.json();
}

export function SandboxConsole({
  partners,
  endUsers,
  accounts,
  beneficiaries,
}: {
  partners: Partner[];
  endUsers: EndUser[];
  accounts: Account[];
  beneficiaries: Beneficiary[];
}) {
  const [accountResponse, setAccountResponse] = useState<string>("");
  const [transferResponse, setTransferResponse] = useState<string>("");
  const [cardResponse, setCardResponse] = useState<string>("");

  const accountForm = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      partnerId: partners[0]?.id ?? "",
      endUserId: endUsers[0]?.id ?? "",
      type: "checking",
      nickname: "Operating Account",
    },
  });

  const transferForm = useForm<z.input<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      accountId: accounts[0]?.id ?? "",
      beneficiaryId: beneficiaries[0]?.id ?? "",
      amountCents: 22000,
      direction: "debit",
      speed: "same_day",
      idempotencyKey: "idem-2230",
    },
  });

  const cardForm = useForm<z.input<typeof cardSchema>>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      partnerId: partners[0]?.id ?? "",
      accountId: accounts[0]?.id ?? "",
      cardholderName: endUsers[0]?.legalName ?? "",
      dailyLimitCents: 85000,
    },
  });

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="space-y-4"
            onSubmit={accountForm.handleSubmit(async (values) => {
              try {
                const result = await postJson("/api/v1/accounts", values);
                setAccountResponse(JSON.stringify(result, null, 2));
                toast.success("Sandbox account created");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Account creation failed");
              }
            })}
          >
            <div>
              <Label>Partner</Label>
              <Select {...accountForm.register("partnerId")}>
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>End user</Label>
              <Select {...accountForm.register("endUserId")}>
                {endUsers.map((endUser) => (
                  <option key={endUser.id} value={endUser.id}>
                    {endUser.legalName}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Account type</Label>
              <Select {...accountForm.register("type")}>
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="business_checking">Business checking</option>
              </Select>
            </div>
            <div>
              <Label>Nickname</Label>
              <Input {...accountForm.register("nickname")} />
            </div>
            <Button className="w-full" type="submit">
              Create account
            </Button>
          </form>
          <Textarea readOnly value={accountResponse} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Simulate ACH transfer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="space-y-4"
            onSubmit={transferForm.handleSubmit(async (values) => {
              try {
                const result = await postJson("/api/v1/transfers", values);
                setTransferResponse(JSON.stringify(result, null, 2));
                toast.success("Transfer simulation complete");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Transfer failed");
              }
            })}
          >
            <div>
              <Label>Account</Label>
              <Select {...transferForm.register("accountId")}>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.nickname} ({account.id})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Beneficiary</Label>
              <Select {...transferForm.register("beneficiaryId")}>
                {beneficiaries.map((beneficiary) => (
                  <option key={beneficiary.id} value={beneficiary.id}>
                    {beneficiary.accountHolderName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Amount (cents)</Label>
                <Input type="number" {...transferForm.register("amountCents")} />
              </div>
              <div>
                <Label>Direction</Label>
                <Select {...transferForm.register("direction")}>
                  <option value="debit">Debit</option>
                  <option value="credit">Credit</option>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Settlement speed</Label>
                <Select {...transferForm.register("speed")}>
                  <option value="same_day">Same day</option>
                  <option value="next_day">Next day</option>
                </Select>
              </div>
              <div>
                <Label>Idempotency key</Label>
                <Input {...transferForm.register("idempotencyKey")} />
              </div>
            </div>
            <Button className="w-full" type="submit">
              Simulate transfer
            </Button>
          </form>
          <Textarea readOnly value={transferResponse} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Issue virtual card</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="space-y-4"
            onSubmit={cardForm.handleSubmit(async (values) => {
              try {
                const result = await postJson("/api/v1/cards", values);
                setCardResponse(JSON.stringify(result, null, 2));
                toast.success("Sandbox card issued");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Card issuance failed");
              }
            })}
          >
            <div>
              <Label>Partner</Label>
              <Select {...cardForm.register("partnerId")}>
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Account</Label>
              <Select {...cardForm.register("accountId")}>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.nickname}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Cardholder</Label>
              <Input {...cardForm.register("cardholderName")} />
            </div>
            <div>
              <Label>Daily limit (cents)</Label>
              <Input type="number" {...cardForm.register("dailyLimitCents")} />
            </div>
            <Button className="w-full" type="submit">
              Issue card
            </Button>
          </form>
          <Textarea readOnly value={cardResponse} />
        </CardContent>
      </Card>
    </div>
  );
}
