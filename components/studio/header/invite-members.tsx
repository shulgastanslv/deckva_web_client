"use client";

import { useState } from "react";
import { UserPlus, Link2, ArrowUpCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function InviteMembersDialog() {
  const [emails, setEmails] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://your-app.com/invite/team-link");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="h-9 rounded-full bg-blue-500 px-3.5 text-[13px] font-semibold text-white hover:bg-blue-500/50"
          >
          <UserPlus className="mr-2 size-3.5" />
          Invite Members
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] rounded-[28px] p-0 border-none gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-bold text-neutral-950 dark:text-neutral-50">
            Invite to workspace
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 flex flex-col gap-4">
          {/* Текстовое поле для email */}
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 size-4 text-neutral-400" />
            <Textarea
              placeholder="Enter or paste email addresses..."
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="min-h-[120px] resize-none rounded-2xl border-neutral-200 bg-neutral-50 pl-10 pt-3 text-[13px] focus-visible:ring-1 focus-visible:ring-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:focus-visible:ring-neutral-700"
            />
          </div>

          {/* Кнопки действий */}
          <div className="flex items-center justify-between gap-2 mt-2">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="h-10 rounded-full px-4 text-[13px] font-medium border-neutral-200 dark:border-neutral-800"
            >
              <Link2 className="mr-2 size-3.5" />
              {isCopied ? "Copied!" : "Copy invite link"}
            </Button>
            <Button
              disabled={!emails.trim()}
              className="h-10 rounded-full px-6 text-[13px] font-medium transition-all"
            >
              Send invitations
            </Button>
            
          </div>

          {/* Плашка Upgrade (в стиле вашего Pro бейджа) */}
          <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#4262ff]/10 p-4 text-[13px] text-[#4262ff] dark:bg-[#4262ff]/15">
            <ArrowUpCircle className="mt-0.5 size-4 shrink-0" />
            <p className="leading-relaxed text-white">
              <a href="#" className="font-semibold underline underline-offset-2 hover:text-[#4262ff]">
                Upgrade
              </a>{" "}
              to invite Guests to shared boards and collaborate securely with clients and partners.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}