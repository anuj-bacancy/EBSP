import type { AppRole } from "@/types/domain";

import { requireSession } from "@/lib/auth/session";

export async function requireRole(allowedRoles: AppRole[]) {
  const session = await requireSession();

  if (!allowedRoles.includes(session.role)) {
    throw new Error("Insufficient role");
  }

  return session;
}
