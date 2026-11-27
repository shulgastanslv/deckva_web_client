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
        "@id": `${SITE_URL}/#website`,
        name: "Deckva",
        url: `${SITE_URL}/`,
        description: t("description"),
        inLanguage: locale,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Deckva",
        url: `${SITE_URL}/`,
        email: "shulgastanislav@gmail.com",
        logo: {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          url: `${SITE_URL}/logo-512.png`,
          contentUrl: `${SITE_URL}/logo-512.png`,
          width: 512,
          height: 512,
          caption: "Deckva",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Deckva",
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        url: `${SITE_URL}/`,
        description: t("description"),
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
