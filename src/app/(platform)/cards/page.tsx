import { SectionTitle } from "@/components/ui/section-title";
import { CardsTable } from "@/features/cards/cards-table";
import { requireSession } from "@/lib/auth/session";
import { listCards } from "@/lib/data/app";

export default async function CardsPage() {
  const session = await requireSession();
  const cards = await listCards(session);

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Cards" title="Virtual card issuance and controls" description="Inspect network placeholder details, masked PANs, spend limits, and card lifecycle states across the seeded sandbox portfolio." />
      <CardsTable data={cards} />
    </div>
  );
}
