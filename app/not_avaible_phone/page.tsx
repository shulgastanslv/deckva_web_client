import type { Metadata } from "next";

import { NotAvailablePhone } from "@/components/not-available-phone";

export const metadata: Metadata = {
  title: "Swibp — open on a computer",
  description: "The Swibp studio is for a wider screen.",
};

export default function NotAvailablePhonePage() {
  return <NotAvailablePhone />;
}
