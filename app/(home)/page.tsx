import { Suspense } from "react";
import { LandingPage } from "@/components/landing/landing-page";

export default function Landing() {
  return (
    <Suspense fallback={null}>
      <LandingPage />
    </Suspense>
  );
}
