"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowClockwise as RefreshCw,
  LinkSimple as LinkIcon,
  PlugsConnected as Plugs,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  disconnectConnectorAction,
  getConnectorsAnalytics,
  listConnectors,
  refreshThreadsInsightsAction,
} from "@/actions/connectors";
import { BrandIcon } from "@/components/studio/brand-icon";
import { CONNECTOR_CATALOG } from "@/lib/connectors/catalog";
import type {
  ConnectorAnalytics,
  ConnectorProviderId,
  ConnectorPublic,
} from "@/lib/connectors/types";
import {
  StudioContent,
  StudioContentBody,
} from "@/components/studio/ui/studio-content";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

function statusTone(status: ConnectorPublic["status"]) {
  switch (status) {
    case "connected":
      return "text-foreground";
    case "error":
    case "expired":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
}

function formatDayLabel(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

export function StudioConnectors() {
  const t = useTranslations("studio.connectors");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState<ConnectorProviderId | "insights" | null>(
    null,
  );
  const [connectors, setConnectors] = useState<ConnectorPublic[]>([]);
  const [analytics, setAnalytics] = useState<ConnectorAnalytics | null>(null);
  const [threadsInsights, setThreadsInsights] = useState<{
    views?: number;
    likes?: number;
    replies?: number;
    reposts?: number;
    quotes?: number;
  } | null>(null);

  const byId = useMemo(() => {
    return new Map(connectors.map((c) => [c.id, c]));
  }, [connectors]);

  const load = async () => {
    const [listRes, analyticsRes] = await Promise.all([
      listConnectors(),
      getConnectorsAnalytics(),
    ]);
    if (listRes.success) setConnectors(listRes.connectors);
    if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
    setReady(true);
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const status = searchParams.get("status");
    const provider = searchParams.get("provider");
    const error = searchParams.get("error") || searchParams.get("detail");
    if (!status && !error) return;

    if (status === "connected" && provider) {
      toast.success(t("toastConnected", { name: providerLabel(provider) }));
      trackEvent("connector_connected", { provider });
    } else if (status === "error" || error) {
      toast.error(t(`errors.${mapErrorKey(error)}`));
      trackEvent("connector_connect_failed", {
        provider: provider ?? "unknown",
        error: error ?? "unknown",
      });
    }
    router.replace("/studio/connectors");
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = (id: ConnectorProviderId) => {
    trackEvent("connector_connect_clicked", { provider: id });
    window.location.href = `/api/connectors/${id}/connect`;
  };

  const disconnect = async (id: ConnectorProviderId) => {
    setBusy(id);
    try {
      const res = await disconnectConnectorAction(id);
      if (res.success === false) {
        toast.error(res.error);
        return;
      }
      setConnectors(res.connectors);
      trackEvent("connector_disconnected", { provider: id });
      toast.success(t("toastDisconnected", { name: providerLabel(id) }));
      const analyticsRes = await getConnectorsAnalytics();
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
    } finally {
      setBusy(null);
    }
  };

  const refreshInsights = async () => {
    setBusy("insights");
    try {
      const res = await refreshThreadsInsightsAction();
      if (res.success === false) {
        toast.error(res.error);
        return;
      }
      setThreadsInsights(res.insights);
      trackEvent("connector_insights_refresh", { provider: "threads" });
      toast.success(t("toastInsights"));
      const analyticsRes = await getConnectorsAnalytics();
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
    } finally {
      setBusy(null);
    }
  };

  if (!ready) {
    return (
      <StudioContent>
        <StudioContentBody>
          <div className="pt-12">
            <div className="mb-12 h-10 w-56 animate-pulse rounded-md bg-muted/40" />
            <div className="space-y-4">
              <div className="h-28 animate-pulse rounded-2xl bg-muted/40" />
              <div className="h-28 animate-pulse rounded-2xl bg-muted/40" />
              <div className="h-40 animate-pulse rounded-2xl bg-muted/40" />
            </div>
          </div>
        </StudioContentBody>
      </StudioContent>
    );
  }

  return (
    <StudioContent>
      <StudioContentBody className="pt-6 sm:pt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <section className="flex flex-col gap-4 border-t border-border/40 py-8 first:border-0 first:pt-0">
          <div>
            <h2 className="text-[17px] font-medium tracking-tight text-foreground">
              {t("available")}
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {t("availableHint")}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {CONNECTOR_CATALOG.map((item) => {
              const state = byId.get(item.id);
              const connected = state?.status === "connected";
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl bg-muted/20 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 items-center justify-center rounded-md bg-background">
                      <BrandIcon brand={item.brand} className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-medium text-foreground">
                          {t(`items.${item.id}.label`)}
                        </h3>
                        <span
                          className={cn(
                            "text-[11px] font-medium uppercase tracking-wide",
                            statusTone(state?.status ?? "disconnected"),
                          )}
                        >
                          {t(`status.${state?.status ?? "disconnected"}`)}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] text-muted-foreground">
                        {t(`items.${item.id}.description`)}
                      </p>
                      {connected && state?.displayName ? (
                        <p className="mt-2 truncate text-[12px] text-foreground">
                          {state.displayName}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {connected ? (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-9 rounded-md bg-muted/40 px-3 text-[13px] shadow-none hover:bg-muted/60"
                          disabled={busy === item.id}
                          onClick={() => void disconnect(item.id)}
                        >
                          {t("disconnect")}
                        </Button>
                        {item.id === "threads" ? (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 rounded-md bg-muted/40 px-3 text-[13px] shadow-none hover:bg-muted/60"
                            disabled={busy === "insights"}
                            onClick={() => void refreshInsights()}
                          >
                            <RefreshCw className="mr-1.5 size-3.5 opacity-70" />
                            {t("refreshInsights")}
                          </Button>
                        ) : null}
                      </>
                    ) : (
                      <Button
                        type="button"
                        className="h-9 rounded-md bg-foreground px-3 text-[13px] text-background shadow-none hover:bg-foreground/90"
                        onClick={() => connect(item.id)}
                      >
                        <LinkIcon className="mr-1.5 size-3.5" />
                        {t("connect")}
                      </Button>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-5 border-t border-border/40 py-8">
          <div>
            <h2 className="text-[17px] font-medium tracking-tight text-foreground">
              {t("analyticsTitle")}
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {t("analyticsHint")}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label={t("statConnected")}
              value={String(analytics?.connectedCount ?? 0)}
            />
            <StatCard
              label={t("statEvents7d")}
              value={String(analytics?.eventsLast7Days ?? 0)}
            />
            <StatCard
              label={t("statEvents30d")}
              value={String(analytics?.eventsLast30Days ?? 0)}
            />
          </div>

          <ActivityChart
            title={t("activity7d")}
            emptyLabel={t("emptyActivity")}
            daily={analytics?.daily ?? []}
          />

          {threadsInsights ? (
            <div className="grid gap-3 sm:grid-cols-5">
              {(
                [
                  ["views", threadsInsights.views],
                  ["likes", threadsInsights.likes],
                  ["replies", threadsInsights.replies],
                  ["reposts", threadsInsights.reposts],
                  ["quotes", threadsInsights.quotes],
                ] as const
              ).map(([key, value]) => (
                <StatCard
                  key={key}
                  label={t(`insights.${key}`)}
                  value={value == null ? "—" : String(value)}
                />
              ))}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {CONNECTOR_CATALOG.map((item) => {
              const stats = analytics?.byProvider[item.id];
              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-muted/20 p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <BrandIcon brand={item.brand} />
                    <span className="text-[13px] font-medium text-foreground">
                      {t(`items.${item.id}.label`)}
                    </span>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12px]">
                    <Metric label={t("metricPublishes")} value={stats?.publishes ?? 0} />
                    <Metric label={t("metricImports")} value={stats?.imports ?? 0} />
                    <Metric label={t("metricInsights")} value={stats?.insights ?? 0} />
                    <Metric label={t("metricErrors")} value={stats?.errors ?? 0} />
                  </dl>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl bg-muted/20 p-4">
            <h3 className="mb-3 text-[13px] font-medium text-foreground">
              {t("recentActivity")}
            </h3>
            {(analytics?.recent.length ?? 0) === 0 ? (
              <p className="text-[13px] text-muted-foreground">{t("emptyActivity")}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {analytics?.recent.map((event) => (
                  <li
                    key={event.id}
                    className="flex items-center gap-2.5 text-[13px]"
                  >
                    <BrandIcon
                      brand={
                        event.provider === "threads" ? "threads" : "googledrive"
                      }
                      className="size-4"
                    />
                    <span className="min-w-0 flex-1 truncate text-foreground">
                      {t(`events.${event.kind}`)}
                      {event.label ? ` · ${event.label}` : ""}
                    </span>
                    <time className="shrink-0 text-[11px] text-muted-foreground">
                      {new Date(event.createdAt).toLocaleString()}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <p className="pb-4 text-[12px] text-muted-foreground">
          {t.rich("promptHint", {
            link: (chunks) => (
              <Link
                href="/studio"
                className="text-foreground underline-offset-2 hover:underline"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
      </StudioContentBody>
    </StudioContent>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/20 px-4 py-3">
      <div className="text-[12px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-medium tracking-tight text-foreground">
        {value}
      </div>
    </div>
  );
}

function ActivityChart({
  title,
  emptyLabel,
  daily,
}: {
  title: string;
  emptyLabel: string;
  daily: Array<{ date: string; count: number }>;
}) {
  const maxDaily = Math.max(1, ...daily.map((d) => d.count));
  const total = daily.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="rounded-2xl bg-muted/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-medium text-foreground">{title}</h3>
        <Plugs className="size-4 text-muted-foreground" />
      </div>
      {total === 0 ? (
        <p className="py-8 text-center text-[13px] text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <div className="flex h-40 items-end gap-2">
          {daily.map((day) => {
            const barMaxPx = 112;
            const heightPx =
              day.count <= 0
                ? 4
                : Math.max(8, Math.round((day.count / maxDaily) * barMaxPx));
            return (
              <div
                key={day.date}
                className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
                title={`${day.date}: ${day.count}`}
              >
                <span
                  className={cn(
                    "text-[10px] font-medium tabular-nums",
                    day.count > 0 ? "text-foreground" : "text-transparent",
                  )}
                >
                  {day.count}
                </span>
                <div
                  className={cn(
                    "w-full rounded-md",
                    day.count > 0 ? "bg-foreground/85" : "bg-muted/50",
                  )}
                  style={{ height: heightPx }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {formatDayLabel(day.date)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function providerLabel(provider: string) {
  if (provider === "threads") return "Threads";
  if (provider === "google-drive") return "Google Drive";
  return provider;
}

function mapErrorKey(error: string | null) {
  switch (error) {
    case "google_not_configured":
      return "google_not_configured";
    case "threads_not_configured":
      return "threads_not_configured";
    case "invalid_state":
    case "missing_code":
      return "oauth_failed";
    case "unknown_provider":
      return "unknown_provider";
    default:
      return "oauth_failed";
  }
}
