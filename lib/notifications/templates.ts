import type { AppMessages } from "@/lib/messages";

/** Stable ids for inbox rows — add a key here + copy in `messages.*.notify`. */
export type NotifyTemplateId =
  | "projectCreated"
  | "generationDone"
  | "published"
  | "republished"
  | "unpublished"
  | "exported"
  | "copied"
  | "imported";

export type NotifyVars = {
  projectId?: string;
  title?: string;
  slidesCount?: number;
};

export type RenderedNotification = {
  title: string;
  body: string;
  href: string | null;
};

type TemplateCopy = { title: string; body: string };

function copy(
  catalog: AppMessages,
  id: NotifyTemplateId,
): TemplateCopy {
  const block = catalog.notify[id];
  return {
    title: block.title,
    body: block.body,
  };
}

function fill(template: string, vars: NotifyVars): string {
  return template
    .replaceAll("{title}", vars.title?.trim() || "Untitled")
    .replaceAll(
      "{slidesCount}",
      vars.slidesCount != null ? String(vars.slidesCount) : "",
    );
}

function editorHref(vars: NotifyVars): string | null {
  const id = vars.projectId?.trim();
  return id ? `/studio/editor?project=${id}` : null;
}

/** Resolve title/body/href for a template using the active message catalog. */
export function renderNotification(
  catalog: AppMessages,
  template: NotifyTemplateId,
  vars: NotifyVars = {},
): RenderedNotification {
  const { title, body } = copy(catalog, template);
  return {
    title: fill(title, vars),
    body: fill(body, vars),
    href: editorHref(vars),
  };
}
