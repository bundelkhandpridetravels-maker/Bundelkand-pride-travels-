"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { EnquirySource } from "@/lib/enquiry";
import BookingModal from "./BookingModal";

export type BookingContextValue = {
  slug?: string;
  title?: string;
  isGroup?: boolean;
  source: EnquirySource;
};

type OpenFn = (ctx?: Partial<BookingContextValue>) => void;

const BookingCtx = createContext<{ open: OpenFn } | null>(null);

/**
 * App-wide booking modal host. Wraps the (server-rendered) page tree and mounts
 * one modal instance. Any client component calls `useBooking().open({...})` to
 * launch it with the package prefilled.
 */
export default function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [ctx, setCtx] = useState<BookingContextValue>({ source: "general" });

  const open = useCallback<OpenFn>((next) => {
    setCtx({
      source: next?.source ?? "general",
      slug: next?.slug,
      title: next?.title,
      isGroup: next?.isGroup,
    });
    setOpen(true);
  }, []);

  return (
    <BookingCtx.Provider value={{ open }}>
      {children}
      <BookingModal isOpen={isOpen} context={ctx} onClose={() => setOpen(false)} />
    </BookingCtx.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingCtx);
  if (!ctx) throw new Error("useBooking must be used within <BookingProvider>");
  return ctx;
}
