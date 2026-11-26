"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Bell,
  Camera as CameraIcon,
  ChartLineUp,
  Check,
  Translate as Languages,
  SpinnerGap as Loader2,
  SignOut as LogOut,
  Monitor,
  Moon,
  Sun,
  Trash as Trash2,
  User as UserRound,
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
import { navIconClass } from "@/components/canvas/sidebar/sidebar-ui";
import { controlH } from "@/components/ui/control";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import {
  localeLabels,
  locales,
  type AppLocale,
} from "@/lib/i18n/config";
import { setAppLocale } from "@/lib/i18n/set-locale";
import { messages } from "@/lib/messages";
import type {
  GenerationDayPoint,
  GenerationUsageStats,
} from "@/lib/studio/generations";
import { DAILY_GENERATION_LIMIT } from "@/lib/studio/plans";
import { cn } from "@/lib/utils";

type Section =
  | "profile"
  | "statistics"
  | "notifications"
  | "preferences"
  | "account";

type UsageState = {
  remaining: number;
  used: number;
  limit: number;
  unlimited: boolean;
  days: GenerationDayPoint[];
  stats: GenerationUsageStats;
};

type NotifyPrefs = {
  product: boolean;
  community: boolean;
  email: boolean;
};

const EMPTY_STATS: GenerationUsageStats = {
  total: 0,
  mostActiveMonth: null,
  mostActiveDay: null,
  longestStreak: 0,
  currentStreak: 0,
};

const NOTIFY_KEY = "swibp.notifyPrefs";

const DEFAULT_NOTIFY: NotifyPrefs = {
  product: true,
  community: true,
  email: false,
};

function readNotifyPrefs(): NotifyPrefs {
  if (typeof window === "undefined") return DEFAULT_NOTIFY;
  try {
    const raw = window.localStorage.getItem(NOTIFY_KEY);
    if (!raw) return DEFAULT_NOTIFY;
    const parsed = JSON.parse(raw) as Partial<NotifyPrefs>;
    return {
      product: parsed.product !== false,
      community: parsed.community !== false,
      email: parsed.email === true,
    };
  } catch {
    return DEFAULT_NOTIFY;
  }
}

const NAV_IDS: { id: Section; icon: typeof UserRound }[] = [
  { id: "profile", icon: UserRound },
  { id: "statistics", icon: ChartLineUp },
  { id: "notifications", icon: Bell },
  { id: "preferences", icon: Monitor },
  { id: "account", icon: LogOut },
];

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
  const [section, setSection] = useState<Section>("profile");
  const [themeMounted, setThemeMounted] = useState(false);
  const [name, setName] = useState("");
  const [initialName, setInitialName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState("");

  const [usage, setUsage] = useState<UsageState>({
    remaining: DAILY_GENERATION_LIMIT,
    used: 0,
    limit: DAILY_GENERATION_LIMIT,
    unlimited: false,
    days: [],
    stats: EMPTY_STATS,
  });
  const [notify, setNotify] = useState<NotifyPrefs>(DEFAULT_NOTIFY);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const nav = NAV_IDS.map((item) => ({
    ...item,
    label: t(`nav.${item.id}`),
  }));

  const avatarSrc = image || session?.user?.image || null;
  const initial = (name.trim()[0] || email[0] || "U").toUpperCase();
  const isDark = themeMounted && resolvedTheme === "dark";

  const nameDirty = name.trim() !== initialName.trim();
  const canSaveProfile = nameDirty && name.trim().length > 0;

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
    setDeleteConfirm("");
    setNotify(readNotifyPrefs());

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

  const onDelete = async () => {
    setError(null);
    setDeleting(true);
    try {
      const res = await deleteAccount({
        confirm: deleteConfirm,
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
        <div className="flex min-h-[440px] w-full min-w-0 flex-col sm:flex-row">
          <aside className="flex w-full min-w-0 shrink-0 flex-col gap-3 bg-muted/20 px-3.5 py-3 sm:w-56">
            <div>
              <DialogTitle className="text-[14px] font-semibold tracking-tight">
                {t("title")}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[13px] text-muted-foreground">
                {t("accountBilling")}
              </DialogDescription>
            </div>

            <nav className="flex gap-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:flex-col sm:overflow-visible">
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
                      controlH,
                      "inline-flex shrink-0 items-center gap-2.5 rounded-md px-3 text-left text-[13px] font-normal transition-colors",
                      active
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                    )}
                  >
                    <Icon className={navIconClass} />
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
                            <div className="absolute inset-0 hidden items-center justify-center rounded-full bg-foreground/40 transition-all group-hover:flex">
                              <CameraIcon className="size-5 text-background" />
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
                            <p className="text-[13px] font-normal">{t("profilePicture")}</p>
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
                                <Trash2 className="size-5 stroke-[1.5]" />
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

                    </div>
                  ) : null}

                  {section === "statistics" ? (
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

                  {section === "notifications" ? (
                    <div className="space-y-3">
                      {(
                        [
                          {
                            key: "product" as const,
                            label: t("notifyProduct"),
                            hint: t("notifyProductHint"),
                          },
                          {
                            key: "community" as const,
                            label: t("notifyCommunity"),
                            hint: t("notifyCommunityHint"),
                          },
                          {
                            key: "email" as const,
                            label: t("notifyEmail"),
                            hint: t("notifyEmailHint"),
                          },
                        ] as const
                      ).map((row) => (
                        <div
                          key={row.key}
                          className="flex items-center justify-between gap-4 rounded-md bg-muted/40 px-3.5 py-3"
                        >
                          <div className="min-w-0">
                            <p className="text-[13px] font-normal">{row.label}</p>
                            <p className="mt-0.5 text-[12px] text-muted-foreground">
                              {row.hint}
                            </p>
                          </div>
                          <Switch
                            checked={notify[row.key]}
                            onCheckedChange={(checked) => {
                              setNotify((prev) => {
                                const next = { ...prev, [row.key]: checked };
                                window.localStorage.setItem(
                                  NOTIFY_KEY,
                                  JSON.stringify(next),
                                );
                                return next;
                              });
                            }}
                            aria-label={row.label}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {section === "preferences" ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4 rounded-md bg-muted/40 px-3.5 py-3">
                        <div className="min-w-0">
                          <p className="text-[13px] font-normal">{t("appearance")}</p>
                          <p className="mt-0.5 text-[12px] text-muted-foreground">
                            {t("appearanceHint")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {isDark ? (
                            <Moon className="size-5 stroke-[1.5] text-muted-foreground" />
                          ) : (
                            <Sun className="size-5 stroke-[1.5] text-muted-foreground" />
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

                      <div className="rounded-md bg-muted/40 px-3.5 py-3">
                        <div className="flex items-start gap-2.5">
                          <Languages className={cn(navIconClass, "mt-0.5 text-muted-foreground")} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-normal">{t("language")}</p>
                            <p className="mt-0.5 text-[12px] text-muted-foreground">
                              {t("languageHint")}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1 rounded-md bg-muted/40 p-1">
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
                                    controlH,
                                    "inline-flex items-center rounded-md px-3 text-[13px] font-normal transition-colors disabled:opacity-60",
                                    code === locale
                                      ? "bg-background text-foreground"
                                      : "text-muted-foreground hover:text-foreground",
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
                      <div className="rounded-md bg-muted/40 px-3.5 py-3">
                        <p className="text-[13px] font-normal">{t("signOut")}</p>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                          {t("signOutHint")}
                        </p>
                        <Button
                          type="button"
                          variant="secondary"
                          className="mt-3"
                          onClick={() => {
                            onOpenChange(false);
                            void signOut({ callbackUrl: "/" });
                          }}
                        >
                          <LogOut className="size-5 stroke-[1.5]" />
                          {t("signOut")}
                        </Button>
                      </div>

                      <div className="rounded-md bg-destructive/10 px-3.5 py-3">
                        <p className="text-[13px] font-normal text-destructive">
                          {t("deleteAccount")}
                        </p>
                        <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                          {t("deleteAccountHint")}
                        </p>

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
                          className="mt-3"
                          disabled={
                            deleting ||
                            deleteConfirm.trim().toUpperCase() !== "DELETE"
                          }
                          onClick={() => void onDelete()}
                        >
                          {deleting ? (
                            <Loader2 className="size-5 animate-spin" />
                          ) : (
                            <Trash2 className="size-5 stroke-[1.5]" />
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

            {!loading && section === "profile" ? (
              <div className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-h-4 text-[12px]">
                  {error ? (
                    <p className="text-destructive">{error}</p>
                  ) : saved ? (
                    <p className="inline-flex items-center gap-1 text-foreground">
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
                    disabled={saving || !canSaveProfile}
                    onClick={() => void onSaveProfile()}
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
