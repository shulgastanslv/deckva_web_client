"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Check, UserCircle2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { studioKeys } from "@/lib/studio/queries";

import { 
  updateOrganization, 
  deleteOrganization, 
  getOrganizationMembers 
} from "@/actions/organizations";

// Используем те же цвета, что и на бэкенде для палитры
const ORG_COLORS = ["#7EB6FF", "#C4B5FD", "#86EFAC", "#FCD34D", "#FDA4AF", "#67E8F9"];

interface OrgDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: { id: string; name: string; color: string; role: string } | null;
}

// --------------------------------------------------------
// 1. Редактирование профиля (Имя и Цвет)
// --------------------------------------------------------
export function EditProfileDialog({ open, onOpenChange, organization }: OrgDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(organization?.name || "");
  const [color, setColor] = useState(organization?.color || "");
  const [isLoading, setIsLoading] = useState(false);

  // Синхронизация стейта при открытии/смене орги
  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setColor(organization.color);
    }
  }, [organization, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !name.trim()) return;

    setIsLoading(true);
    try {
      const res = await updateOrganization(organization.id, { name: name.trim(), color });
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: studioKeys.organizations });
        window.dispatchEvent(new CustomEvent("studio:org-changed"));
        onOpenChange(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Organization Name</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Acme Corp" 
              className="rounded-xl"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium">Avatar Color</label>
            <div className="flex flex-wrap gap-2">
              {ORG_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full transition-transform hover:scale-110",
                    color === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""
                  )}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="size-4 text-black/60" />}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 bg-transparent">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-full" disabled={isLoading || !name.trim()}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------
// 2. Управление участниками
// --------------------------------------------------------
export function ManageMembersDialog({ open, onOpenChange, organization }: OrgDialogProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && organization) {
      setIsLoading(true);
      getOrganizationMembers(organization.id).then((res) => {
        if (res.success) setMembers(res.members);
        setIsLoading(false);
      });
    } else {
      setMembers([]);
    }
  }, [open, organization]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {members.map((member) => (
                <div key={member.user.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {member.user.image ? (
                      <img src={member.user.image} alt="" className="size-8 rounded-full" />
                    ) : (
                      <UserCircle2 className="size-8 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{member.user.name || "User"}</p>
                      <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase bg-muted px-2 py-1 rounded-full">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------
// 3. Удаление организации (с подтверждением названия)
// --------------------------------------------------------
export function DeleteOrganizationDialog({ open, onOpenChange, organization }: OrgDialogProps) {
  const queryClient = useQueryClient();
  const [confirmName, setConfirmName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Сброс поля при закрытии
  useEffect(() => {
    if (!open) setConfirmName("");
  }, [open]);

  const isOwner = organization?.role === "OWNER";
  const canDelete = confirmName === organization?.name;

  const handleDelete = async () => {
    if (!organization || !canDelete) return;
    
    setIsLoading(true);
    try {
      const res = await deleteOrganization(organization.id);
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: studioKeys.organizations });
        window.dispatchEvent(new CustomEvent("studio:org-changed"));
        window.dispatchEvent(new CustomEvent("studio:folders-changed"));
        window.dispatchEvent(new CustomEvent("core:projects-changed"));
        onOpenChange(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Organization</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {!isOwner ? (
            <div className="p-3 bg-muted rounded-xl text-sm">
              Only the <strong>OWNER</strong> can delete this organization.
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. All projects and folders will be permanently deleted.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Type <span className="font-bold select-all">{organization?.name}</span> to confirm
                </label>
                <Input 
                  value={confirmName} 
                  onChange={(e) => setConfirmName(e.target.value)} 
                  className="rounded-full mt-4"
                  disabled={isLoading}
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter className="flex justify-end gap-2 bg-transparent">
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            disabled={!canDelete || !isOwner || isLoading} 
            onClick={handleDelete}
            className="rounded-full"
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Delete Organization
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}