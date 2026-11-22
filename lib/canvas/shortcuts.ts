import type { CanvasManager } from "./manager";
import type { SlidesController } from "./slides";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { useCanvasStore } from "@/store/useCanvasStore";
import {
  canCopySelection,
  hasRememberedSelection,
  pasteClipboardText,
  pasteImageFiles,
  pasteImageUrl,
  pasteRemembered,
  rememberSelection,
} from "./clipboard";
import { canUngroup, groupSelection, ungroupSelection } from "./group";
import { copyStyleFromSelection, hasCopiedStyle, pasteObjectStyle } from "./style-clipboard";
import {
  CANVAS_CLIPBOARD_MARKER,
  CANVAS_CLIPBOARD_MIME,
  classifyClipboardText,
  imageFilesFromClipboard,
  imageUrlFromHtml,
} from "./clipboard-content";

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    (el as HTMLElement).isContentEditable
  );
}

function isEditingCanvasText(manager: CanvasManager): boolean {
  const active = manager.getActiveObject();
  return Boolean(active && "isEditing" in active && active.isEditing);
}

function hasOpenOverlay(): boolean {
  return Boolean(
    document.querySelector(
      "[role='dialog'][data-state='open'], [data-slot='select-content'], [data-slot='dropdown-menu-content'], [data-slot='popover-content']",
    ),
  );
}

function hasDomTextSelection(): boolean {
  const selection = window.getSelection();
  return Boolean(selection && !selection.isCollapsed && selection.toString().length > 0);
}

export function bindKeyboardShortcuts(
  manager: CanvasManager,
  slides: SlidesController,
  target: Window = window,
): () => void {
  let suppressClipboard = false;

  const stepSlide = (dir: 1 | -1) => {
    if (dir < 0) void slides.prev();
    else void slides.next();
  };

  const handleCopy = (e: ClipboardEvent) => {
    if (suppressClipboard) return;
    if (isTypingTarget(document.activeElement) || isEditingCanvasText(manager)) return;
    if (!canCopySelection(manager.canvas) || hasDomTextSelection()) return;
    if (!e.clipboardData) return;

    e.preventDefault();
    rememberSelection(manager.canvas);
    e.clipboardData.setData("text/plain", CANVAS_CLIPBOARD_MARKER);
    try {
      e.clipboardData.setData(CANVAS_CLIPBOARD_MIME, CANVAS_CLIPBOARD_MARKER);
    } catch {
      // text/plain marker is enough for paste inside the editor
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    if (suppressClipboard) return;
    if (isTypingTarget(document.activeElement) || isEditingCanvasText(manager)) return;

    const data = e.clipboardData;
    if (!data) {
      if (!hasRememberedSelection()) return;
      e.preventDefault();
      void pasteRemembered(manager.canvas);
      return;
    }

    const images = imageFilesFromClipboard(data.files, data.items);
    if (images.length > 0) {
      e.preventDefault();
      void pasteImageFiles(manager.objects, images).catch((error) => {
        reportError(error, messages.errors.pasteImage);
      });
      return;
    }

    const kind = classifyClipboardText(
      data.getData("text/plain"),
      data.getData(CANVAS_CLIPBOARD_MIME) === CANVAS_CLIPBOARD_MARKER,
    );

    if (kind.kind === "objects") {
      if (!hasRememberedSelection()) return;
      e.preventDefault();
      void pasteRemembered(manager.canvas);
      return;
    }

    if (kind.kind === "image-url") {
      e.preventDefault();
      void pasteImageUrl(manager.objects, kind.url);
      return;
    }

    if (kind.kind === "text") {
      e.preventDefault();
      pasteClipboardText(manager.objects, kind.text);
      return;
    }

    const htmlUrl = imageUrlFromHtml(data.getData("text/html"));
    if (htmlUrl) {
      e.preventDefault();
      void pasteImageUrl(manager.objects, htmlUrl);
      return;
    }

    if (hasRememberedSelection()) {
      e.preventDefault();
      void pasteRemembered(manager.canvas);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Crop is modal: only Esc / Enter escape it.
    if (manager.crop.active) {
      if (e.key === "Escape") {
        e.preventDefault();
        manager.crop.cancel();
        return;
      }
      if (e.key === "Enter" && !isTypingTarget(document.activeElement)) {
        e.preventDefault();
        manager.crop.apply();
        return;
      }
      // Swallow the rest so delete / tools / undo don't leak through.
      if (!isTypingTarget(document.activeElement)) {
        e.preventDefault();
      }
      return;
    }

    if (isTypingTarget(document.activeElement)) return;
    if (isEditingCanvasText(manager)) return;
    if (hasOpenOverlay()) return;

    const active = manager.getActiveObject();
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();
    const store = useCanvasStore.getState();

    // Ctrl/⌘+Alt+C and Ctrl/⌘+Alt+V center the selection. Don't also copy or paste.
    if (mod && e.altKey && (key === "c" || key === "v")) {
      suppressClipboard = true;
      window.setTimeout(() => {
        suppressClipboard = false;
      }, 0);
    }

    if (key === "delete" || key === "backspace") {
      e.preventDefault();
      manager.objects.deleteSelected();
      return;
    }

    if (mod && key === "d") {
      e.preventDefault();
      manager.objects.duplicateSelected();
      return;
    }

    if (mod && key === "z" && !e.shiftKey) {
      e.preventDefault();
      void manager.undo();
      return;
    }

    if (mod && (key === "y" || (key === "z" && e.shiftKey))) {
      e.preventDefault();
      void manager.redo();
      return;
    }

    if (mod && e.altKey && key === "h" && active) {
      e.preventDefault();
      manager.grid.centerObject(active, "horizontal");
      manager.commit();
      return;
    }

    if (mod && e.altKey && key === "v" && active) {
      e.preventDefault();
      manager.grid.centerObject(active, "vertical");
      manager.commit();
      return;
    }

    if (mod && e.altKey && key === "c" && active) {
      e.preventDefault();
      manager.grid.centerObject(active, "both");
      manager.commit();
      return;
    }

    if (mod && key === "g") {
      e.preventDefault();
      if (e.shiftKey) {
        if (canUngroup(active)) manager.transact(() => ungroupSelection(manager.canvas));
      } else if (manager.canvas.getActiveObjects().length >= 2) {
        manager.transact(() => groupSelection(manager.canvas));
      }
      return;
    }

    if (mod && e.shiftKey && key === "c") {
      e.preventDefault();
      copyStyleFromSelection(manager.canvas);
      return;
    }

    if (mod && e.shiftKey && key === "v") {
      e.preventDefault();
      if (hasCopiedStyle()) manager.transact(() => pasteObjectStyle(manager.canvas));
      return;
    }

    // Plain tool / place shortcuts (no modifiers).
    if (mod || e.altKey || e.shiftKey || e.repeat) return;

    if (key === "v") {
      e.preventDefault();
      store.setHandActive(false);
      store.setEraserActive(false);
      return;
    }

    if (key === "h") {
      e.preventDefault();
      store.toggleHand();
      return;
    }

    if (key === "e") {
      e.preventDefault();
      store.setEraserActive(!store.eraserActive);
      return;
    }

    if (key === "t") {
      e.preventDefault();
      store.setHandActive(false);
      store.setEraserActive(false);
      manager.objects.addParagraph();
      return;
    }

    if (key === "r") {
      e.preventDefault();
      store.setHandActive(false);
      store.setEraserActive(false);
      manager.objects.addRectangle();
      return;
    }

    if (key === "o") {
      e.preventDefault();
      store.setHandActive(false);
      store.setEraserActive(false);
      manager.objects.addEllipse();
      return;
    }

    if (key === "l") {
      e.preventDefault();
      store.setHandActive(false);
      store.setEraserActive(false);
      manager.objects.addLine();
      return;
    }

    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      stepSlide(-1);
      return;
    }

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      stepSlide(1);
    }
  };

  target.addEventListener("keydown", handleKeyDown);
  target.addEventListener("copy", handleCopy);
  target.addEventListener("paste", handlePaste);
  return () => {
    target.removeEventListener("keydown", handleKeyDown);
    target.removeEventListener("copy", handleCopy);
    target.removeEventListener("paste", handlePaste);
  };
}
