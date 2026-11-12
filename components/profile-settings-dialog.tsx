"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Camera as CameraIcon,
  Check,
  CreditCard,
  Key as KeyRound,
  Translate as Languages,
  SpinnerGap as Loader2,
  SignOut as LogOut,
  Monitor,
  Moon,
  Sun,
  Trash as Trash2,
  User as UserRound,
  Wallet,
} from "@phosphor-icons/react";
import { signOut, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import {
  attachPaymentCard,
  cancelSubscription,
  detachPaymentCard,
  getBilling,
  purchaseCredits,
  resumeSubscription,
  subscribePro,
} from "@/actions/billing";
import { deleteAccount, getProfile, updateProfile } from "@/actions/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatCardBrand } from "@/lib/billing/card";
import type { BillingSnapshot } from "@/lib/billing/types";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import {
  localeLabels,
  locales,
  type AppLocale,
} from "@/lib/i18n/config";
import { setAppLocale } from "@/lib/i18n/set-locale";
import { messages } from "@/lib/messages";
import { isPasswordLongEnough, PASSWORD_MIN_LENGTH } from "@/lib/auth/password";
import {
  CREDIT_PACK_CREDITS,
  CREDIT_PACK_PRICE,
  STUDIO_PRO_CURRENCY,
  STUDIO_PRO_PRICE,
} from "@/lib/studio/plans";
import { cn } from "@/lib/utils";

type Section = "profile" | "billing" | "security" | "preferences" | "account";

const NAV_IDS: { id: Section; icon: typeof UserRound }[] = [
  { id: "profile", icon: UserRound },
  { id: "billing", icon: Wallet },
  { id: "security", icon: KeyRound },
  { id: "preferences", icon: Monitor },
  { id: "account", icon: LogOut },
];

function formatJoined(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function paymentStatusKey(status: string) {
  switch (status) {
    case "SUCCEEDED":
      return "paymentStatus.paid" as const;
    case "FAILED":
      return "paymentStatus.failed" as const;
    case "REFUNDED":
      return "paymentStatus.refunded" as const;
    default:
      return "paymentStatus.pending" as const;
  }
}

export function ProfileSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session, update } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const t = useTranslations("dialogs.settings");
  const [localePending, startLocaleTransition] = useTransition();
  const nav = NAV_IDS.map((item) => ({
    ...item,
    label: t(`nav.${item.id}`),
  }));
  const [section, setSection] = useState<Section>("profile");
  const [themeMounted, setThemeMounted] = useState(false);

  const [name, setName] = useState("");
  const [initialName, setInitialName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const [billing, setBilling] = useState<BillingSnapshot | null>(null);
  const [billingBusy, setBillingBusy] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const userId = session?.user?.id ?? "";
  const avatarSrc =
    image ||
    session?.user?.image ||
    (userId
      ? `https://api.dicebear.com/10.x/squircles/svg?seed=${userId}`
      : undefined);
  const initial = (name.trim()[0] || email[0] || "U").toUpperCase();
  const isDark = themeMounted && resolvedTheme === "dark";

  const nameDirty = name.trim() !== initialName.trim();
  const passwordDirty = Boolean(
    currentPassword || newPassword || confirmPassword,
  );
  const canSaveProfile = nameDirty && name.trim().length > 0;
  const canSaveSecurity = passwordDirty;

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setSection("profile");
    setLoading(true);
    setError(null);
    setSaved(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setDeleteConfirm("");
    setDeletePassword("");
    setCardNumber("");
    setExp("");
    setCvv("");

    void Promise.all([getProfile(), getBilling()]).then(([profileRes, billRes]) => {
      if (cancelled) return;
      setLoading(false);
      if (!profileRes.success) {
        setError((profileRes as { error: string }).error);
        return;
      }
      setName(profileRes.name ?? "");
      setInitialName(profileRes.name ?? "");
      setEmail(profileRes.email);
      setImage(profileRes.image);
      setHasPassword(profileRes.hasPassword);
      setEmailVerified(Boolean(profileRes.emailVerified));
      setCreatedAt(profileRes.createdAt);
      if (billRes.success) {
        setBilling(billRes.billing);
        setShowCardForm(!billRes.billing.paymentMethod);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const sectionTitle = useMemo(
    () => nav.find((item) => item.id === section)?.label ?? t("title"),
    [nav, section, t],
  );

  const onSaveProfile = async () => {
    setError(null);
    setSaved(false);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t("validation.enterName"));
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({
        name: trimmedName,
        image: image ?? null,
      });
      if (!res.success) {
        setError((res as { error: string }).error);
        return;
      }
      // Remote URLs can live in the JWT; data URLs stay in DB + local profile cache.
      const sessionImage =
        typeof res.image === "string" && /^https?:\/\//i.test(res.image)
          ? res.image
          : null;
      await update({ name: res.name, image: sessionImage });
      setImage(res.image);
      setInitialName(res.name ?? trimmedName);
      setSaved(true);
      window.dispatchEvent(new CustomEvent("studio:profile-changed"));
    } finally {
      setSaving(false);
    }
  };

  const onPickAvatar = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setSaved(false);
    if (!file.type.startsWith("image/")) {
      setError(messages.errors.chooseImage);
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file, {
        maxEdge: 384,
        quality: 0.82,
      });
      if (dataUrl.length > 450_000) {
        setError(messages.errors.assetTooLarge);
        return;
      }
      setSaving(true);
      const res = await updateProfile({ image: dataUrl });
      if (!res.success) {
        setError((res as { error: string }).error);
        return;
      }
      setImage(res.image);
      setSaved(true);
      window.dispatchEvent(new CustomEvent("studio:profile-changed"));
    } catch {
      setError(messages.errors.readAvatar);
    } finally {
      setSaving(false);
    }
  };

  const onSaveSecurity = async () => {
    setError(null);
    setSaved(false);

    if (!isPasswordLongEnough(newPassword)) {
      setError(t("validation.passwordMin"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("validation.passwordsMismatch"));
      return;
    }
    if (hasPassword && !currentPassword) {
      setError(t("validation.currentPassword"));
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({
        currentPassword: hasPassword ? currentPassword : undefined,
        newPassword,
      });
      if (!res.success) {
        setError((res as { error: string }).error);
        return;
      }
      setHasPassword(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setError(null);
    setDeleting(true);
    try {
      const res = await deleteAccount({
        confirm: deleteConfirm,
        password: hasPassword ? deletePassword : undefined,
      });
      if (!res.success) {
        setError((res as { error: string }).error);
        return;
      }
      onOpenChange(false);
      await signOut({ callbackUrl: "/" });
    } finally {
      setDeleting(false);
    }
  };

  const parseExp = () => {
    const m = exp.replace(/\s/g, "").match(/^(\d{2})\s*\/\s*(\d{2}|\d{4})$/);
    if (!m) return null;
    return { month: Number(m[1]), year: Number(m[2]) };
  };

  const runBilling = async (
    fn: () => Promise<
      | { success: true; billing: BillingSnapshot }
      | { success: false; error: string }
    >,
  ) => {
    setBillingBusy(true);
    setError(null);
    try {
      const res = await fn();
      if (res.success === false) {
        setError(res.error);
        return;
      }
      setBilling(res.billing);
      window.dispatchEvent(new CustomEvent("studio:org-changed"));
      setCardNumber("");
      setExp("");
      setCvv("");
      setShowCardForm(false);
    } finally {
      setBillingBusy(false);
    }
  };

  const onSaveCard = () =>
    void runBilling(async () => {
      const parsed = parseExp();
      if (!parsed) {
        return { success: false as const, error: t("validation.expiry") };
      }
      return attachPaymentCard({
        number: cardNumber,
        expMonth: parsed.month,
        expYear: parsed.year,
        cvv,
      });
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-[640px]"
      >
        <div className="flex min-h-[440px] flex-col sm:flex-row">
          <aside className="flex shrink-0 flex-col bg-muted/25 sm:w-[168px]">
            <div className="px-4 pt-4 pb-2">
              <DialogTitle className="text-[13px] font-semibold tracking-tight">
                {t("title")}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[11px] text-muted-foreground">
                {t("accountBilling")}
              </DialogDescription>
            </div>

            <nav className="flex gap-1 overflow-x-auto px-2 pb-3 sm:flex-col sm:overflow-visible sm:px-2 sm:pb-4">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSection(item.id);
                      setError(null);
                      setSaved(false);
                    }}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-left text-[12.5px] font-medium transition-colors",
                      active
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="px-5 pt-4 pb-2">
              <h3 className="text-[14px] font-semibold tracking-tight">
                {sectionTitle}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3">
              {loading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {section === "profile" ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                          <div className="relative group cursor-pointer">
                            <Avatar className="size-16 ring-1 ring-border/20">
                              <AvatarImage src={avatarSrc} alt={name || email} className="object-cover" />
                              <AvatarFallback className="bg-muted text-lg font-medium text-foreground">
                                {initial}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded-md transition-all">
                              <CameraIcon className="size-5 text-white/90" />
                            </div>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                              disabled={saving}
                              onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                event.target.value = "";
                                void onPickAvatar(file);
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{t("profilePicture")}</p>
                            <p className="mt-1 text-[12px] text-muted-foreground">
                              {t("profilePictureHint")}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="profile-name" className="text-[12px]">
                            {t("displayName")}
                          </Label>
                          <Input
                            id="profile-name"
                            value={name}
                            className="h-9 rounded-xl bg-muted/40 px-3"
                            onChange={(event) => {
                              setName(event.target.value);
                              setSaved(false);
                            }}
                            placeholder={t("yourName")}
                            autoComplete="name"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="profile-email" className="text-[12px]">
                            {t("email")}
                          </Label>
                          <Input
                            id="profile-email"
                            value={email}
                            readOnly
                            disabled
                            className="h-9 rounded-xl bg-muted/30 px-3"
                          />
                        </div>
                    </div>
                  ) : null}

                  {section === "billing" ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl bg-muted/35 px-4 py-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[13px] font-semibold">
                              {billing?.isPro ? t("planPro") : t("planFree")}
                            </p>
                            <p className="mt-0.5 text-[12px] text-muted-foreground">
                              {billing?.isPro
                                ? billing.cancelAtPeriodEnd
                                  ? t("ends", { date: formatDate(billing.subscriptionEndsAt) })
                                  : t("renews", { date: formatDate(billing.subscriptionEndsAt) })
                                : t("generationsLeft", {
                                    remaining: billing?.freeGenerationsRemaining ?? 0,
                                    limit: billing?.freeGenerationsLimit ?? 3,
                                    price: STUDIO_PRO_PRICE,
                                    currency: STUDIO_PRO_CURRENCY,
                                  })}
                            </p>
                            {billing?.isPro ? (
                              <p className="mt-1.5 text-[12px] text-muted-foreground">
                                {t("creditsBalance", {
                                  total: billing.creditsTotal,
                                  plan: billing.creditsPlan,
                                  topup: billing.creditsTopup,
                                })}
                              </p>
                            ) : null}
                          </div>
                          {billing?.isPro ? (
                            billing.cancelAtPeriodEnd ? (
                              <Button
                                type="button"
                                variant="outline"
                                className="h-8 rounded-md text-[12px]"
                                disabled={billingBusy}
                                onClick={() =>
                                  void runBilling(() => resumeSubscription())
                                }
                              >
                                {t("resume")}
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-8 rounded-md text-[12px] text-muted-foreground"
                                disabled={billingBusy}
                                onClick={() =>
                                  void runBilling(() => cancelSubscription())
                                }
                              >
                                {t("cancel")}
                              </Button>
                            )
                          ) : (
                            <Button
                              type="button"
                              className="h-8 rounded-md bg-[#2f5bff] text-[12px] text-white hover:bg-[#254ae6]"
                              disabled={billingBusy || !billing?.paymentMethod}
                              onClick={() =>
                                void runBilling(() => subscribePro())
                              }
                            >
                              {billingBusy ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                t("subscribe")
                              )}
                            </Button>
                          )}
                        </div>
                        {billing?.isPro ? (
                          <Button
                            type="button"
                            variant="secondary"
                            className="mt-3 h-8 w-full rounded-md text-[12px] shadow-none"
                            disabled={billingBusy || !billing.paymentMethod}
                            onClick={() =>
                              void runBilling(() => purchaseCredits())
                            }
                          >
                            {billingBusy ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              t("buyCreditsPack", {
                                credits:
                                  billing.creditPackCredits ?? CREDIT_PACK_CREDITS,
                                price:
                                  billing.creditPackPrice ?? CREDIT_PACK_PRICE,
                                currency: STUDIO_PRO_CURRENCY,
                              })
                            )}
                          </Button>
                        ) : null}
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-[12px] font-medium text-foreground">
                            {t("paymentMethod")}
                          </p>
                          {billing?.paymentMethod && !showCardForm ? (
                            <button
                              type="button"
                              className="text-[11px] font-medium text-[#2f5bff]"
                              onClick={() => setShowCardForm(true)}
                            >
                              {t("replace")}
                            </button>
                          ) : null}
                        </div>

                        {billing?.paymentMethod && !showCardForm ? (
                          <div className="flex items-center gap-3 rounded-2xl bg-muted/35 px-3.5 py-3">
                            <CreditCard className="size-4 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-medium">
                                {formatCardBrand(billing.paymentMethod.brand)}{" "}
                                ···· {billing.paymentMethod.last4}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {t("cardExpires", {
                                  month: String(billing.paymentMethod.expMonth).padStart(2, "0"),
                                  year: String(billing.paymentMethod.expYear).slice(-2),
                                })}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-8 rounded-md text-[12px] text-muted-foreground"
                              disabled={billingBusy}
                              onClick={() =>
                                void runBilling(() =>
                                  detachPaymentCard(billing.paymentMethod!.id),
                                )
                              }
                            >
                              {t("remove")}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Input
                              value={cardNumber}
                              onChange={(e) =>
                                setCardNumber(formatCardNumber(e.target.value))
                              }
                              placeholder={t("cardNumber")}
                              inputMode="numeric"
                              autoComplete="cc-number"
                              className="h-9 rounded-xl bg-muted/40 px-3 text-[13px]"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={exp}
                                onChange={(e) => {
                                  let v = e.target.value.replace(/[^\d/]/g, "");
                                  if (
                                    v.length === 2 &&
                                    !v.includes("/") &&
                                    exp.length < 2
                                  ) {
                                    v = `${v}/`;
                                  }
                                  setExp(v.slice(0, 7));
                                }}
                                placeholder={t("exp")}
                                inputMode="numeric"
                                autoComplete="cc-exp"
                                className="h-9 rounded-xl bg-muted/40 px-3 text-[13px]"
                              />
                              <Input
                                value={cvv}
                                onChange={(e) =>
                                  setCvv(
                                    e.target.value.replace(/\D/g, "").slice(0, 4),
                                  )
                                }
                                placeholder={t("cvv")}
                                inputMode="numeric"
                                autoComplete="cc-csc"
                                type="password"
                                className="h-9 rounded-xl bg-muted/40 px-3 text-[13px]"
                              />
                            </div>
                            <div className="flex gap-2 pt-1">
                              {billing?.paymentMethod ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-8 rounded-md text-[12px]"
                                  onClick={() => setShowCardForm(false)}
                                >
                                  {t("cancel")}
                                </Button>
                              ) : null}
                              <Button
                                type="button"
                                className="h-8 rounded-md text-[12px]"
                                disabled={billingBusy}
                                onClick={onSaveCard}
                              >
                                {billingBusy ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  t("saveCard")
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="mb-2 text-[12px] font-medium">{t("history")}</p>
                        {billing?.payments.length ? (
                          <ul className="space-y-1">
                            {billing.payments.map((p) => (
                              <li
                                key={p.id}
                                className="flex items-center justify-between gap-3 rounded-xl px-1 py-2 text-[12px]"
                              >
                                <div className="min-w-0">
                                  <p className="truncate font-medium">
                                    {p.description || t("payment")}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {formatDate(p.paidAt ?? p.createdAt)}
                                    {p.cardLast4
                                      ? ` · ${p.cardBrand ?? t("card")} ···· ${p.cardLast4}`
                                      : null}
                                  </p>
                                </div>
                                <div className="shrink-0 text-right">
                                  <p className="font-medium tabular-nums">
                                    {p.amount} {p.currency}
                                  </p>
                                  <p
                                    className={cn(
                                      "text-[10px]",
                                      p.status === "SUCCEEDED"
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : p.status === "FAILED"
                                          ? "text-destructive"
                                          : "text-muted-foreground",
                                    )}
                                  >
                                    {t(paymentStatusKey(p.status))}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[12px] text-muted-foreground">
                            {t("noPayments")}
                          </p>
                        )}
                      </div>

                      {error ? (
                        <p className="text-[12px] text-destructive">{error}</p>
                      ) : null}
                    </div>
                  ) : null}

                  {section === "security" ? (
                    <div className="space-y-3.5">
                      <p className="text-[12px] leading-relaxed text-muted-foreground">
                        {hasPassword
                          ? t("changePasswordHint")
                          : t("setPasswordHint")}
                      </p>

                      {hasPassword ? (
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="profile-current-password"
                            className="text-[12px]"
                          >
                            {t("currentPassword")}
                          </Label>
                          <Input
                            id="profile-current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(event) => {
                              setCurrentPassword(event.target.value);
                              setSaved(false);
                            }}
                            autoComplete="current-password"
                            className="h-9 rounded-xl bg-muted/40 px-3"
                          />
                        </div>
                      ) : null}

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="profile-new-password"
                          className="text-[12px]"
                        >
                          {t("newPassword")}
                        </Label>
                        <Input
                          id="profile-new-password"
                          type="password"
                          value={newPassword}
                          onChange={(event) => {
                            setNewPassword(event.target.value);
                            setSaved(false);
                          }}
                          autoComplete="new-password"
                          className="h-9 rounded-xl bg-muted/40 px-3"
                          placeholder={t("passwordMin")}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="profile-confirm-password"
                          className="text-[12px]"
                        >
                          {t("confirmPassword")}
                        </Label>
                        <Input
                          id="profile-confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(event) => {
                            setConfirmPassword(event.target.value);
                            setSaved(false);
                          }}
                          autoComplete="new-password"
                          className="h-9 rounded-xl bg-muted/40 px-3"
                        />
                      </div>
                    </div>
                  ) : null}

                  {section === "preferences" ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/35 px-4 py-3.5">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium">{t("appearance")}</p>
                          <p className="mt-0.5 text-[12px] text-muted-foreground">
                            {t("appearanceHint")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {isDark ? (
                            <Moon className="size-4 text-muted-foreground" />
                          ) : (
                            <Sun className="size-4 text-muted-foreground" />
                          )}
                          <Switch
                            checked={isDark}
                            onCheckedChange={(checked) =>
                              setTheme(checked ? "dark" : "light")
                            }
                            aria-label={t("darkThemeAria")}
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl bg-muted/35 px-4 py-3.5">
                        <div className="flex items-start gap-2.5">
                          <Languages className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium">{t("language")}</p>
                            <p className="mt-0.5 text-[12px] text-muted-foreground">
                              {t("languageHint")}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {locales.map((code) => (
                                <button
                                  key={code}
                                  type="button"
                                  disabled={localePending}
                                  onClick={() => {
                                    if (code === locale || localePending) return;
                                    startLocaleTransition(async () => {
                                      const res = await setAppLocale(code);
                                      if (res.ok) router.refresh();
                                    });
                                  }}
                                  className={cn(
                                    "inline-flex h-8 items-center rounded-md px-3 text-[12px] font-medium transition-colors disabled:opacity-60",
                                    code === locale
                                      ? "bg-foreground text-background"
                                      : "bg-muted/50 text-foreground hover:bg-muted/70",
                                  )}
                                >
                                  {localeLabels[code]}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {section === "account" ? (
                    <div className="space-y-3.5">
                      <div className="rounded-2xl bg-muted/35 px-4 py-3.5">
                        <p className="text-[13px] font-medium">{t("signOut")}</p>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                          {t("signOutHint")}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-3 h-8 rounded-md"
                          onClick={() => {
                            onOpenChange(false);
                            void signOut({ callbackUrl: "/" });
                          }}
                        >
                          <LogOut className="size-3.5" />
                          {t("signOut")}
                        </Button>
                      </div>

                      <div className="rounded-2xl bg-destructive/5 px-4 py-3.5 ring-1 ring-destructive/10">
                        <p className="text-[13px] font-medium text-destructive">
                          {t("deleteAccount")}
                        </p>
                        <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                          {t("deleteAccountHint")}
                        </p>

                        {hasPassword ? (
                          <div className="mt-3 space-y-1.5">
                            <Label htmlFor="delete-password" className="text-[12px]">
                              {t("deletePassword")}
                            </Label>
                            <Input
                              id="delete-password"
                              type="password"
                              value={deletePassword}
                              onChange={(event) =>
                                setDeletePassword(event.target.value)
                              }
                              autoComplete="current-password"
                              className="h-9 rounded-xl bg-background/80 px-3"
                            />
                          </div>
                        ) : null}

                        <div className="mt-3 space-y-1.5">
                          <Label htmlFor="delete-confirm" className="text-[12px]">
                            {t("typeDelete")}
                          </Label>
                          <Input
                            id="delete-confirm"
                            value={deleteConfirm}
                            onChange={(event) =>
                              setDeleteConfirm(event.target.value)
                            }
                            placeholder={t("deletePlaceholder")}
                            className="h-9 rounded-xl bg-background/80 px-3"
                            autoComplete="off"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="destructive"
                          className="mt-3 h-8 rounded-md"
                          disabled={
                            deleting ||
                            deleteConfirm.trim().toUpperCase() !== "DELETE" ||
                            (hasPassword && !deletePassword)
                          }
                          onClick={() => void onDelete()}
                        >
                          {deleting ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                          {t("deleteAccount")}
                        </Button>
                      </div>

                      {error ? (
                        <p className="text-[12px] text-destructive">{error}</p>
                      ) : null}
                    </div>
                  ) : null}
                </>
              )}
            </div>

            {!loading && (section === "profile" || section === "security") ? (
              <div className="flex items-center justify-between gap-3 bg-muted/15 px-5 py-3">
                <div className="min-h-4 text-[12px]">
                  {error ? (
                    <p className="text-destructive">{error}</p>
                  ) : saved ? (
                    <p className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3.5" />
                      {t("saved")}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 rounded-md"
                    onClick={() => onOpenChange(false)}
                    disabled={saving}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="button"
                    className="h-8 rounded-md"
                    disabled={
                      saving ||
                      (section === "profile"
                        ? !canSaveProfile
                        : !canSaveSecurity)
                    }
                    onClick={() =>
                      void (section === "profile"
                        ? onSaveProfile()
                        : onSaveSecurity())
                    }
                  >
                    {saving ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      t("save")
                    )}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
