import type { DbAffiliate } from "@/lib/db/types";

export type PublicAffiliate = Omit<DbAffiliate, "password_hash">;

export function publicAffiliate(a: DbAffiliate): PublicAffiliate {
  const { password_hash: _omit, ...rest } = a;
  return rest;
}

export function publicAffiliates(list: DbAffiliate[]): PublicAffiliate[] {
  return list.map(publicAffiliate);
}
