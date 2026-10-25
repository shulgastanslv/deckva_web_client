import type { Metadata } from "next";

import { NotAvailablePhone } from "@/components/not-available-phone";

export const metadata: Metadata = {
  title: "Откройте на компьютере",
  description:
    "Студия Deckva рассчитана на широкий экран. Откройте сайт с ноутбука или десктопа.",
};

export default function NotAvailablePhonePage() {
  return <NotAvailablePhone />;
}
