"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getPackById, PACKS, type Pack } from "@/data/packs";

export type CartItem = {
  packId: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addPack: (packId: string, quantity?: number) => void;
  setQuantity: (packId: string, quantity: number) => void;
  removeItem: (packId: string) => void;
  clear: () => void;
};

const KNOWN_IDS = new Set(PACKS.map((p) => p.id));

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addPack: (packId, quantity = 1) => {
        // Accept known pack ids (live prices come from /api/catalog + server).
        if (!KNOWN_IDS.has(packId) && !getPackById(packId)) return;
        set((state) => {
          const existing = state.items.find((i) => i.packId === packId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.packId === packId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { packId, quantity }] };
        });
      },
      setQuantity: (packId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(packId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.packId === packId ? { ...i, quantity } : i,
          ),
        }));
      },
      removeItem: (packId) =>
        set((state) => ({
          items: state.items.filter((i) => i.packId !== packId),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "suertu2s-cart" },
  ),
);

export type HydratedCartItem = CartItem & { pack: Pack };

export function getHydratedItems(
  items: CartItem[],
  packs?: Pack[],
): HydratedCartItem[] {
  const lookup = (id: string) =>
    packs?.find((p) => p.id === id) ?? getPackById(id);

  return items
    .map((item) => {
      const pack = lookup(item.packId);
      if (!pack) return null;
      return { ...item, pack };
    })
    .filter(Boolean) as HydratedCartItem[];
}

export function getCartSubtotal(items: CartItem[], packs?: Pack[]) {
  return getHydratedItems(items, packs).reduce(
    (acc, item) => acc + item.pack.priceClp * item.quantity,
    0,
  );
}

export function getCartTicketCount(items: CartItem[], packs?: Pack[]) {
  return getHydratedItems(items, packs).reduce(
    (acc, item) => acc + item.pack.ticketCount * item.quantity,
    0,
  );
}

export function getCartItemCount(items: CartItem[]) {
  return items.reduce((acc, item) => acc + item.quantity, 0);
}
