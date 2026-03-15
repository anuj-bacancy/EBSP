export function DemoIdentities() {
  return (
    <div className="space-y-3 rounded-[28px] border border-[var(--border)] bg-[var(--panel)] p-6">
      <h3 className="font-semibold">Sign-in requirements</h3>
      <div className="space-y-3 text-sm text-[var(--muted-foreground)]">
        <div className="rounded-2xl border border-[var(--border)] bg-black/10 px-4 py-3">
          <p className="font-medium text-[var(--foreground)]">Use your Supabase users</p>
          <p>Create a new user from the Sign up page or via Supabase Auth dashboard.</p>
          <p className="mt-2 uppercase tracking-[0.18em] text-[var(--brand-400)]">Roles and access are assigned from profile and membership rows</p>
        </div>
      </div>
    </div>
  );
}
