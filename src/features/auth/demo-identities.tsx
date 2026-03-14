export function DemoIdentities() {
  return (
    <div className="space-y-3 rounded-[28px] border border-[var(--border)] bg-[var(--panel)] p-6">
      <h3 className="font-semibold">Supabase Auth setup</h3>
      <div className="space-y-3 text-sm text-[var(--muted-foreground)]">
        <div className="rounded-2xl border border-[var(--border)] bg-black/10 px-4 py-3">
          <p className="font-medium text-[var(--foreground)]">Use your seeded Supabase users</p>
          <p>Create users with `supabase/seed.sql` or sign up from the UI.</p>
          <p className="mt-2 uppercase tracking-[0.18em] text-[var(--brand-400)]">Partner and admin roles are assigned from profile + membership rows</p>
        </div>
      </div>
    </div>
  );
}
