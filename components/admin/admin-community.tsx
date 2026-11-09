"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, Search } from "lucide-react";
import Link from "next/link";

import {
  listCommunityProjects,
  setCommunityReviewStatus,
  type CommunityProjectListItem,
  type CommunityReviewStatus,
} from "@/actions/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function AdminCommunity() {
  const [projects, setProjects] = useState<CommunityProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CommunityReviewStatus | "all">("PENDING");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await listCommunityProjects({
        search: search.trim() || undefined,
        status,
      });
      if (!res.success) {
        setProjects([]);
        setMessage("Failed to load community projects");
        return;
      }
      setProjects(res.projects);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, search ? 220 : 0);
    return () => window.clearTimeout(t);
  }, [load, search]);

  const review = async (
    id: string,
    next: Exclude<CommunityReviewStatus, "DRAFT">,
  ) => {
    setBusyId(id);
    setMessage(null);
    try {
      const res = await setCommunityReviewStatus(id, next);
      if (!res.success) {
        setMessage("Failed to update status");
        return;
      }
      setMessage(next === "APPROVED" ? "Approved" : "Updated");
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-6 py-8">
      <div>
        <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
          Community moderation
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Approve or reject public carousel submissions.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search community"
            className="h-9 rounded-full bg-muted/50 pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as CommunityReviewStatus | "all")}
        >
          <SelectTrigger className="h-9 w-[140px] rounded-full border-0 bg-muted/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {message ? (
        <p className="text-[13px] text-muted-foreground">{message}</p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <p className="py-12 text-center text-[13px] text-muted-foreground">
          No submissions found.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {projects.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl bg-muted/30 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-foreground">
                  {item.title}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  {item.authorName ?? "Unknown"} · {item.communityStatus}
                </p>
              </div>
              <Link
                href={`/view/${item.id}`}
                target="_blank"
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ExternalLink className="size-3.5" />
                View
              </Link>
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  className={cn(
                    "h-9 rounded-full",
                    item.communityStatus === "APPROVED" && "opacity-50",
                  )}
                  disabled={busyId === item.id}
                  onClick={() => void review(item.id, "APPROVED")}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-9 rounded-full"
                  disabled={busyId === item.id}
                  onClick={() => void review(item.id, "REJECTED")}
                >
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
