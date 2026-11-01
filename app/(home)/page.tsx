import { Suspense } from "react";
import { LandingPage } from "@/components/landing/landing-page";
import { getLandingStats } from "@/actions/landing-stats";

export default async function Landing() {
  const stats = await getLandingStats();
  return (
    <Suspense fallback={null}>
      <LandingPage stats={stats} />
    </Suspense>
  );
}
