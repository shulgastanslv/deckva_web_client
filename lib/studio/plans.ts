export type OrgPlanId = "starter" | "business" | "enterprise";

export const ORG_PLANS: Array<{
  id: OrgPlanId;
  name: string;
  blurb: string;
  monthlyPerSeat: number | null;
  cta: string;
  secondaryCta?: string;
  highlight?: boolean;
  ribbon?: string;
  badge?: string;
  featuresTitle: string;
  features: string[];
}> = [
  {
    id: "starter",
    name: "Starter",
    blurb:
      "For creators and small teams that need more room to ship carousels.",
    monthlyPerSeat: 8,
    cta: "Upgrade",
    featuresTitle: "Everything in Free, plus:",
    features: [
      "Unlimited & private carousels",
      "Visitor viewing links",
      "High-resolution exports",
      "Project folders & templates",
      "25 AI credits / member / month",
      "Custom fonts & styles",
      "Priority render queue",
    ],
  },
  {
    id: "business",
    name: "Business",
    blurb:
      "For growing orgs that need brand control and secure team collaboration.",
    monthlyPerSeat: 20,
    cta: "Try for free",
    secondaryCta: "or upgrade now",
    highlight: true,
    ribbon: "Best for teams",
    badge: "25% off for 5+ members",
    featuresTitle: "Everything in Starter, plus:",
    features: [
      "Shared brand kits",
      "Team folders & roles",
      "Multi-step AI workflows",
      "50 AI credits / member / month",
      "Publish analytics",
      "User groups",
      "Single Sign-On (SSO)",
      "Priority AI generation",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    blurb:
      "For large organizations that need security, governance, and control at scale.",
    monthlyPerSeat: null,
    cta: "Contact us",
    featuresTitle: "Everything in Business, plus:",
    features: [
      "Enterprise-grade security",
      "Regional data options",
      "Centralized admin & analytics",
      "Custom AI credit pools",
      "SCIM provisioning",
      "Org-wide integration controls",
      "Sandbox workspaces",
      "Dedicated success",
    ],
  },
];

export type CompareCell = boolean | string;

export const PLAN_COMPARE_ROWS: Array<{
  label: string;
  values: Record<"free" | OrgPlanId, CompareCell>;
}> = [
  {
    label: "Editable carousels",
    values: {
      free: "3",
      starter: "Unlimited",
      business: "Unlimited",
      enterprise: "Unlimited",
    },
  },
  {
    label: "Private sharing",
    values: { free: false, starter: true, business: true, enterprise: true },
  },
  {
    label: "Templates",
    values: { free: true, starter: true, business: true, enterprise: true },
  },
  {
    label: "Org folders",
    values: { free: false, starter: true, business: true, enterprise: true },
  },
  {
    label: "Brand kits",
    values: { free: false, starter: false, business: true, enterprise: true },
  },
  {
    label: "AI credits / member / month",
    values: {
      free: "Trial",
      starter: "25",
      business: "50",
      enterprise: "Custom",
    },
  },
  {
    label: "AI workflows",
    values: {
      free: "Trial",
      starter: "Trial",
      business: true,
      enterprise: true,
    },
  },
  {
    label: "Publish analytics",
    values: { free: false, starter: false, business: true, enterprise: true },
  },
  {
    label: "SSO / SCIM",
    values: {
      free: false,
      starter: false,
      business: "SSO",
      enterprise: "SSO + SCIM",
    },
  },
  {
    label: "Admin & governance",
    values: {
      free: false,
      starter: "Basic",
      business: "Team",
      enterprise: "Org-wide",
    },
  },
];

export const PLAN_FAQ: Array<{ q: string; a: string }> = [
  {
    q: "How do I pick the right plan?",
    a: "Starter fits solo makers and tiny teams. Business is for shared brand kits, roles, and more AI. Enterprise is for SSO, SCIM, and custom limits.",
  },
  {
    q: "Who counts as a paid member?",
    a: "Anyone with an active seat in your organization. View-only guests on Business and above do not consume a paid seat.",
  },
  {
    q: "How does pricing work?",
    a: "Starter and Business are billed per member. Business gets 25% off from 5 members. Enterprise is custom from 30 members.",
  },
  {
    q: "What are AI credits?",
    a: "Credits power carousel generation and rewrite steps. They reset each month; Enterprise can negotiate a shared pool.",
  },
  {
    q: "What happens if I add or remove members mid-cycle?",
    a: "Seats are prorated. Adding members increases the next invoice; removals apply from the following billing period.",
  },
  {
    q: "What payment options do you offer?",
    a: "Cards for Starter and Business. Enterprise can pay by invoice or wire — email hello@swibp.io.",
  },
];

export function planLabel(plan: string | null | undefined) {
  const found = ORG_PLANS.find((p) => p.id === plan);
  return found?.name ?? "Starter";
}

export function priceForPlan(planId: OrgPlanId, members: number) {
  const plan = ORG_PLANS.find((p) => p.id === planId);
  if (!plan) return "";
  if (plan.monthlyPerSeat == null) {
    return "Custom price — from 30 members";
  }
  const seats = Math.max(1, members);
  let perSeat = plan.monthlyPerSeat;
  if (planId === "business" && seats >= 5) {
    perSeat = Math.round(perSeat * 0.75);
  }
  const total = perSeat * seats;
  return `$${total} /month for ${seats} member${seats === 1 ? "" : "s"}`;
}
