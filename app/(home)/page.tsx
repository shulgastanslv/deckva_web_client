import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";

import { LandingPage } from "@/components/landing/landing-page";
import { SITE_URL } from "@/lib/seo/og";

export default async function Landing() {
  const t = await getTranslations("meta");
  const locale = await getLocale();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Deckva",
        url: SITE_URL,
        description: t("description"),
        inLanguage: locale,
      },
      {
        "@type": "Organization",
        name: "Deckva",
        url: SITE_URL,
        email: "shulgastanislav@gmail.com",
        logo: `${SITE_URL}/browser.svg`,
      },
      {
        "@type": "SoftwareApplication",
        name: "Deckva",
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "BYN",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={null}>
        <LandingPage />
      </Suspense>
    </>
  );
}
