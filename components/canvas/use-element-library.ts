"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  Circle,
  Code2,
  Diamond,
  Ellipse,
  Hexagon,
  Laptop,
  Minus,
  Pencil,
  Quote,
  Smartphone,
  Square,
  Star,
  Tablet,
  Triangle,
  Tv,
  Type,
} from "lucide-react";
import { fileToDataUrl } from "@/lib/image/file-to-data-url";
import { useCanvasManager } from "@/context/canvas-manager";
import type { FrameKind } from "@/lib/canvas/frames";

export interface ElementItem {
  label: string;
  icon: LucideIcon;
  action: () => void;
  title?: string;
}

export interface ElementSection {
  id: string;
  title: string;
  items: ElementItem[];
}

export const FRAME_ITEMS: { kind: FrameKind; label: string; icon: LucideIcon }[] = [
  { kind: "iphone", label: "iPhone", icon: Smartphone },
  { kind: "android", label: "Android", icon: Smartphone },
  { kind: "ipad", label: "iPad", icon: Tablet },
  { kind: "tablet", label: "Tablet", icon: Tablet },
  { kind: "laptop", label: "Laptop", icon: Laptop },
  { kind: "monitor", label: "Monitor", icon: Tv },
];

export function useElementLibrary() {
  const manager = useCanvasManager();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frameInputRef = useRef<HTMLInputElement>(null);
  const [frameDragging, setFrameDragging] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const addImageFromFile = (file: File) => {
    if (!file.type.startsWith("image/") || !manager) return;
    void fileToDataUrl(file)
      .then((dataUrl) => manager.objects.addImage(dataUrl))
      .catch((err) => {
        console.error(err);
      });
  };

  const fillFrameFromFile = (file: File) => {
    if (!file.type.startsWith("image/") || !manager) return;
    void fileToDataUrl(file)
      .then((dataUrl) => manager.objects.fillActiveFrame(dataUrl))
      .catch((err) => {
        console.error(err);
      });
  };

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) addImageFromFile(file);
    e.target.value = "";
  };

  const handleFrameFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) fillFrameFromFile(file);
    e.target.value = "";
  };

  const addImageFromUrl = async () => {
    const trimmed = imageUrl.trim();
    if (!trimmed || !manager) return;

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
      if (!/^https?:$/i.test(parsed.protocol)) {
        setUrlError("Use an http(s) link");
        return;
      }
    } catch {
      setUrlError("Invalid link");
      return;
    }

    setUrlError(null);
    setUrlLoading(true);
    try {
      await manager.objects.addImage(parsed.toString());
      setImageUrl("");
    } catch (err) {
      console.error(err);
      setUrlError("Couldn't load the image (CORS?)");
    } finally {
      setUrlLoading(false);
    }
  };

  const sections: ElementSection[] = useMemo(
    () => [
      {
        id: "elements-text",
        title: "Text",
        items: [
          { label: "Heading", icon: Type, action: () => manager?.objects.addHeading() },
          { label: "Subtitle", icon: Type, action: () => manager?.objects.addSubtitle() },
          { label: "Paragraph", icon: AlignLeft, action: () => manager?.objects.addParagraph() },
          { label: "Text", icon: Pencil, action: () => manager?.objects.addText("New text") },
          { label: "Quote", icon: Quote, action: () => manager?.objects.addQuote() },
          {
            label: "Code",
            icon: Code2,
            title: "Code block",
            action: () => manager?.objects.addCodeBlock(),
          },
        ],
      },
      {
        id: "elements-shapes",
        title: "Shapes",
        items: [
          { label: "Rectangle", icon: Square, action: () => manager?.objects.addRectangle() },
          { label: "Circle", icon: Circle, action: () => manager?.objects.addCircle() },
          { label: "Triangle", icon: Triangle, action: () => manager?.objects.addTriangle() },
          { label: "Diamond", icon: Diamond, action: () => manager?.objects.addDiamond() },
          { label: "Star", icon: Star, action: () => manager?.objects.addStar() },
          { label: "Hexagon", icon: Hexagon, action: () => manager?.objects.addHexagon() },
          { label: "Ellipse", icon: Ellipse, action: () => manager?.objects.addEllipse() },
          { label: "Line", icon: Minus, action: () => manager?.objects.addLine() },
          { label: "Divider", icon: Minus, action: () => manager?.objects.addDividerLine() },
        ],
      },
    ],
    [manager],
  );

  return {
    manager,
    sections,
    frames: FRAME_ITEMS,
    fileInputRef,
    frameInputRef,
    frameDragging,
    setFrameDragging,
    isDragging,
    setIsDragging,
    imageUrl,
    setImageUrl,
    urlLoading,
    urlError,
    setUrlError,
    addImageFromFile,
    fillFrameFromFile,
    handleImageFileChange,
    handleFrameFileChange,
    addImageFromUrl,
  };
}
