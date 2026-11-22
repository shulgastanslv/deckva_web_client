"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Camera as CameraIcon,
  Check,
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

import { getGenerationStatus } from "@/actions/ai";
import { deleteAccount, getProfile, updateProfile } from "@/actions/user";
import { GenerationHeatmap } from "@/components/studio/ui/generation-heatmap";
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
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import {
  localeLabels,
  locales,
  type AppLocale,
} from "@/lib/i18n/config";
import { setAppLocale } from "@/lib/i18n/set-locale";
import { messages } from "@/lib/messages";
import { isPasswordLongEnough, PASSWORD_MIN_LENGTH } from "@/lib/auth/password";
import { useDisplayCurrency } from "@/hooks/use-display-currency";
import { CURRENCY_LABELS } from "@/lib/studio/currency";
import type {
  GenerationDayPoint,
  GenerationUsageStats,
} from "@/lib/studio/generations";
import { DAILY_GENERATION_LIMIT } from "@/lib/studio/plans";
import { cn } from "@/lib/utils";

type Section = "profile" | "usage" | "security" | "preferences" | "account";

type UsageState = {
  remaining: number;
  used: number;
  limit: number;
  unlimited: boolean;
  days: GenerationDayPoint[];
  stats: GenerationUsageStats;
};

const EMPTY_STATS: GenerationUsageStats = {
  total: 0,
  mostActiveMonth: null,
  mostActiveDay: null,
  longestStreak: 0,
  currentStreak: 0,
};

const NAV_IDS: { id: Section; icon: typeof UserRound }[] = [
  { id: "profile", icon: UserRound },
  { id: "usage", icon: Wallet },
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

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.8 7.3l3.7 2.9C6.4 7.2 9 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
      />
      <path
        fill="#FBBC05"
        d="M5.5 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.8 7.3C.7 9.5 0 10.7 0 12.5s.7 3 1.8 5.2l3.7-2.9z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.6-2.2-6.5-5.2L1.8 15.8C3.7 19.5 7.5 23 12 23z"
      />
    </svg>
  );
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
  const { currency, setCurrency, currencies } = useDisplayCurrency();
  const [section, setSection] = useState<Section>("profile");
  const [themeMounted, setThemeMounted] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);
  const [profileReady, setProfileReady] = useState(false);

  const [name, setName] = useState("");
  const [initialName, setInitialName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const [usage, setUsage] = useState<UsageState>({
    remaining: DAILY_GENERATION_LIMIT,
    used: 0,
    limit: DAILY_GENERATION_LIMIT,
    unlimited: false,
    days: [],
    stats: EMPTY_STATS,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  /** Google / OAuth-only accounts have no local password. */
  const isGoogleAccount = profileReady && !hasPassword;
  const nav = NAV_IDS.filter((item) => !(isGoogleAccount && item.id === "security")).map(
    (item) => ({
      ...item,
      label: t(`nav.${item.id}`),
    }),
  );

  const avatarSrc = image || session?.user?.image || null;
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
    setProfileReady(false);
    setError(null);
    setSaved(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setDeleteConfirm("");
    setDeletePassword("");

    void Promise.all([getProfile(), getGenerationStatus()])
      .then(([profileRes, status]) => {
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
        setProfileReady(true);
        setEmailVerified(Boolean(profileRes.emailVerified));
        setCreatedAt(profileRes.createdAt);
        setUsage({
          remaining: status.entitlement.remaining,
          used: status.entitlement.used,
          limit: status.entitlement.limit,
          unlimited: Boolean(status.entitlement.unlimited),
          days: status.days ?? [],
          stats: status.stats ?? EMPTY_STATS,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setLoading(false);
        setError(err instanceof Error ? err.message : messages.errors.generic);
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

  const onRemoveAvatar = async () => {
    if (!avatarSrc || saving) return;
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const res = await updateProfile({ image: null });
      if (!res.success) {
        setError((res as { error: string }).error);
        return;
      }
      setImage(null);
      await update({ image: null });
      setSaved(true);
      window.dispatchEvent(new CustomEvent("studio:profile-changed"));
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
      onOpenChange(false);
      await signOut({ callbackUrl: "/" });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-[720px]"
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
                            <Avatar className="size-16 rounded-full ring-1 ring-border/20">
                              {avatarSrc ? (
                                <AvatarImage
                                  src={avatarSrc}
                                  alt={name || email}
                                  referrerPolicy="no-referrer"
                                  className="rounded-full object-cover"
                                />
                              ) : null}
                              <AvatarFallback className="rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                                {initial}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 hidden items-center justify-center rounded-full bg-black/40 transition-all group-hover:flex">
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
                            {avatarSrc ? (
                              <button
                                type="button"
                                disabled={saving}
                                aria-label={t("removeAvatarAria")}
                                onClick={() => void onRemoveAvatar()}
                                className="mt-2 inline-flex items-center gap-1.5 rounded-md px-0 text-[12px] font-normal text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
                              >
                                <Trash2 className="size-3.5" />
                                {t("removeAvatar")}
                              </button>
                            ) : null}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="profile-name" className="text-[12px]">
                            {t("displayName")}
                          </Label>
                          <Input
                            id="profile-name"
                            value={name}
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
                            tabIndex={-1}
                            className="bg-muted/30 text-muted-foreground hover:bg-muted/30"
                          />
                        </div>

                        {profileReady && isGoogleAccount ? (
                          <div
                            className="flex w-full min-h-12 items-center gap-2.5 rounded-md bg-muted/40 px-4 py-3.5 text-[13px] font-normal text-foreground"
                            title={t("signedInGoogle")}
                          >
                            <GoogleMark className="size-5 shrink-0" />
                            <span>{t("signedInGoogle")}</span>
                          </div>
                        ) : null}
                    </div>
                  ) : null}

                  {section === "usage" ? (
                    <div className="space-y-3">
                      <GenerationHeatmap
                        days={usage.days}
                        stats={usage.stats}
                        remaining={usage.remaining}
                        limit={usage.limit}
                        unlimited={usage.unlimited}
                      />
                      <p className="px-0.5 text-[12px] text-muted-foreground">
                        {usage.unlimited
                          ? t("unlimitedUsage")
                          : t("dailyUsage", {
                              remaining: usage.remaining,
                              limit: usage.limit,
                            })}
                      </p>
                    </div>
                  ) : null}

                  {section === "security" && !isGoogleAccount ? (
                    <div className="space-y-3.5">
                      <p className="text-[12px] leading-relaxed text-muted-foreground">
                        {t("changePasswordHint")}
                      </p>

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
                        />
                      </div>

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
                                    "inline-flex h-9 items-center rounded-md px-3.5 text-[13px] font-normal transition-colors disabled:opacity-60",
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

                      <div className="rounded-2xl bg-muted/35 px-4 py-3.5">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium">{t("currency")}</p>
                          <p className="mt-0.5 text-[12px] text-muted-foreground">
                            {t("currencyHint")}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {currencies.map((code) => (
                              <button
                                key={code}
                                type="button"
                                onClick={() => setCurrency(code)}
                                className={cn(
                                  "inline-flex h-9 items-center rounded-md px-3.5 text-[13px] font-normal transition-colors",
                                  code === currency
                                    ? "bg-foreground text-background"
                                    : "bg-muted/50 text-foreground hover:bg-muted/70",
                                )}
                              >
                                {CURRENCY_LABELS[code]}
                              </button>
                            ))}
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
                          className="mt-3 rounded-md"
                          onClick={() => {
                            onOpenChange(false);
                            void signOut({ callbackUrl: "/" });
                          }}
                        >
                          <LogOut className="size-5 stroke-[1.5]" />
                          {t("signOut")}
                        </Button>
                      </div>

                      {!isGoogleAccount ? (
                        <div className="rounded-2xl bg-destructive/5 px-4 py-3.5 ring-1 ring-destructive/10">
                          <p className="text-[13px] font-medium text-destructive">
                            {t("deleteAccount")}
                          </p>
                          <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                            {t("deleteAccountHint")}
                          </p>

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
                              className="bg-background/80"
                            />
                          </div>

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
                              className="bg-background/80"
                              autoComplete="off"
                            />
                          </div>

                          <Button
                            type="button"
                            variant="destructive"
                            className="mt-3 rounded-md"
                            disabled={
                              deleting ||
                              deleteConfirm.trim().toUpperCase() !== "DELETE" ||
                              !deletePassword
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
                      ) : null}

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
                    className="rounded-md"
                    onClick={() => onOpenChange(false)}
                    disabled={saving}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="button"
                    className="rounded-md"
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
                      <Loader2 className="size-5 animate-spin" />
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
