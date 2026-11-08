"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { updateTextArtifact } from "@/actions/artifacts";
import { PipelineNextSteps } from "@/components/studio/pipeline/pipeline-next-steps";
import { useStudioCreate } from "@/components/studio/lib/use-studio-create";
import {
  StudioContent,
  StudioContentBody,
} from "@/components/studio/ui/studio-content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useArtifact, studioKeys } from "@/lib/studio/queries";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";

export function StudioTextArtifact({ artifactId }: { artifactId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const create = useStudioCreate();
  const query = useArtifact(artifactId, true);
  const artifact = query.data?.artifact;

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!artifact) return;
    setTitle(artifact.title);
    setText(typeof artifact.payload.text === "string" ? artifact.payload.text : "");
    setDirty(false);
  }, [artifact]);

  const save = async () => {
    if (!artifact) return;
    setSaving(true);
    try {
      const res = await updateTextArtifact(artifact.id, { title, text });
      if (!res.success) {
        const message = "error" in res ? res.error : messages.errors.generic;
        reportError(new Error(message), message);
        return;
      }
      setDirty(false);
      await queryClient.invalidateQueries({ queryKey: studioKeys.artifact(artifactId) });
      await queryClient.invalidateQueries({ queryKey: studioKeys.artifactsRoot });
    } catch (err) {
      reportError(err, messages.errors.generic);
    } finally {
      setSaving(false);
    }
  };

  if (query.isLoading) {
    return (
      <StudioContent>
        <StudioContentBody className="flex justify-center py-24">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </StudioContentBody>
      </StudioContent>
    );
  }

  if (!artifact || artifact.kind !== "TEXT") {
    return (
      <StudioContent>
        <StudioContentBody className="py-16">
          <p className="text-[15px] text-muted-foreground">Text not found.</p>
          <Button
            type="button"
            variant="ghost"
            className="mt-3 rounded-full px-0"
            onClick={() => router.push("/studio")}
          >
            Back to studio
          </Button>
        </StudioContentBody>
      </StudioContent>
    );
  }

  return (
    <StudioContent>
      <StudioContentBody className="max-w-3xl pt-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setDirty(true);
              }}
              className="w-full bg-transparent text-2xl font-semibold tracking-tight text-foreground outline-none"
              placeholder="Untitled text"
            />
            {artifact.prompt ? (
              <p className="mt-1 text-[13px] text-muted-foreground">
                Prompt: {artifact.prompt}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              onClick={() => router.push("/studio/browse?tab=texts")}
            >
              Browse
            </Button>
            <Button
              type="button"
              className="rounded-full"
              disabled={!dirty || saving}
              onClick={() => void save()}
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>

        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setDirty(true);
          }}
          rows={16}
          className="min-h-[320px] rounded-2xl border-none bg-muted/30 text-[15px] leading-relaxed shadow-none focus-visible:ring-1"
          placeholder="Post caption…"
        />

        <div className="mt-6 space-y-3">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            This caption feeds the carousel as seed text — slides and topic
            inherit it when you continue.
          </p>
          <PipelineNextSteps
            from="text"
            onSelect={(kind) => {
              const seed = text.trim() || artifact.prompt || title;
              if (kind === "carousel") {
                void create.generateCarousel({
                  topic: title.trim() || artifact.prompt || seed.slice(0, 80),
                  seedText: text.trim() || undefined,
                  parentArtifactId: artifact.id,
                });
                return;
              }
              if (kind === "palette") {
                void create.generatePalette({
                  topic: seed,
                  parentArtifactId: artifact.id,
                });
              }
            }}
          />
          {create.generating ? (
            <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Starting carousel…
            </p>
          ) : null}
          {create.generateError ? (
            <p className="text-[13px] text-destructive">{create.generateError}</p>
          ) : null}
        </div>
      </StudioContentBody>
    </StudioContent>
  );
}
