"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  Circle,
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
import { rememberRecentPhoto } from "@/lib/canvas/recent-photos";
import { useCanvasManager } from "@/context/canvas-manager";
import { messages } from "@/lib/messages";
import { reportError } from "@/lib/report-error";
import { HeadingIcon } from "@/components/canvas/text-icons";
import { SubtitleIcon } from "@/components/canvas/text-icons";
import { ParagraphIcon } from "@/components/canvas/text-icons";
import { QuoteIcon } from "@/components/canvas/text-icons";
import { IconProps } from "@/components/canvas/text-icons";
import { RectangleShapeIcon } from "@/components/canvas/shapes-icons";
import { CircleShapeIcon } from "@/components/canvas/shapes-icons";
import { TriangleShapeIcon } from "@/components/canvas/shapes-icons";
import { DiamondShapeIcon } from "@/components/canvas/shapes-icons";
import { StarShapeIcon } from "@/components/canvas/shapes-icons";
import { HexagonShapeIcon } from "@/components/canvas/shapes-icons";
import { EllipseShapeIcon } from "@/components/canvas/shapes-icons";
import { LineShapeIcon } from "@/components/canvas/shapes-icons";
import { DividerShapeIcon } from "@/components/canvas/shapes-icons";


export interface ElementItem {
  label: string;
  icon: React.FC<IconProps> ;
  action: () => void;
  title?: string;
}

export interface ElementSection {
  id: string;
  title: string;
  items: ElementItem[];
}


export const FRAME_ITEMS = [
  { kind: "iphone18pro", label: "iPhone 18 Pro", src: "https://assets.postspark.app/mockups/thumbnails/iphone_18_pro.webp" },
  { kind: "iphone18promax", label: "iPhone 18 Pro Max", src: "https://assets.postspark.app/mockups/thumbnails/iphone_18_pro_max.webp" },
  { kind: "iphoneDuoClose", label: "iPhone Duo Close", src: "https://assets.postspark.app/mockups/thumbnails/iphone_duo_closed.webp" },
  { kind: "iphoneDuoOpen", label: "iPhone Duo Open", src: "https://assets.postspark.app/mockups/thumbnails/iphone_duo_open.webp" },
  { kind: "iphone17pro", label: "iPhone 17 Pro", src: "https://assets.postspark.app/mockups/thumbnails/iphone_17_pro.webp" },
  { kind: "iphone17promax", label: "iPhone 17 Pro Max", src: "https://assets.postspark.app/mockups/thumbnails/iphone_17_pro_max.webp" },
  { kind: "iphoneAir", label: "iPhone Air", src: "https://assets.postspark.app/mockups/thumbnails/iphone_air.webp" },
  { kind: "iphone17", label: "iPhone 17", src: "https://assets.postspark.app/mockups/thumbnails/iphone_17.webp" },
  { kind: "iphone16pro", label: "iPhone 16 Pro", src: "https://assets.postspark.app/mockups/thumbnails/iphone_16_pro.webp" },
  { kind: "iphone16promax", label: "iPhone 16 Pro Max", src: "https://assets.postspark.app/mockups/thumbnails/iphone_16_pro_max.webp" },
  { kind: "iphone16", label: "iPhone 16", src: "https://assets.postspark.app/mockups/thumbnails/iphone_16.webp" },
  { kind: "iphone15pro", label: "iPhone 15 Pro", src: "https://assets.postspark.app/mockups/thumbnails/iphone_15_pro.webp" },
  { kind: "iphone15promax", label: "iPhone 15 Pro Max", src: "https://assets.postspark.app/mockups/thumbnails/iphone_15_pro_max.webp" },
  { kind: "iphone15", label: "iPhone 15", src: "https://assets.postspark.app/mockups/thumbnails/iphone_15.webp" },
  { kind: "iphone13", label: "iPhone 13", src: "https://assets.postspark.app/mockups/thumbnails/iphone_13.webp" },
  { kind: "iphone13pro", label: "iPhone 13 Pro", src: "https://assets.postspark.app/mockups/thumbnails/iphone_13_pro.webp" },
  { kind: "android", label: "Android", src: "https://assets.postspark.app/mockups/thumbnails/pixel_7.webp" },
  { kind: "ipadA16", label: "iPad A16", src: "https://assets.postspark.app/mockups/thumbnails/ipad_a16.webp" },
  { kind: "ipadPro13M4", label: "iPad A17", src: "https://assets.postspark.app/mockups/thumbnails/ipad_pro_13_m4.webp" },
  { kind: "ipadPro12", label: "iPad Pro 12", src: "https://assets.postspark.app/mockups/thumbnails/ipad_pro_12.9.webp" },
  { kind: "ipadAir", label: "iPad Air", src: "https://assets.postspark.app/mockups/thumbnails/ipad_air.webp" },
  { kind: "ipadMini", label: "iPad Mini", src: "https://assets.postspark.app/mockups/thumbnails/ipad_mini.webp" },
  { kind: "macbookAir13M5", label: "MacBook 13 M5", src: "https://assets.postspark.app/mockups/thumbnails/macbook_air_13_m5.webp" },
  { kind: "macbookAir15M5", label: "MacBook 15 M5", src: "https://assets.postspark.app/mockups/thumbnails/macbook_air_15_m5.webp" },
  { kind: "macbookneo", label: "MacBook Neo", src: "https://assets.postspark.app/mockups/thumbnails/macbook_neo.webp" },
  { kind: "macbookair13gen4", label: "MacBook Air 13 Gen 4", src: "https://assets.postspark.app/mockups/thumbnails/macbook_air_13_gen_4.webp" },
  { kind: "imac24", label: "iMac 24", src: "https://assets.postspark.app/mockups/thumbnails/imac_24.webp" },
  { kind: "proDisplayXDR", label: "Pro Display XDR", src: "https://assets.postspark.app/mockups/thumbnails/pro_display_xdr.webp" },
  { kind: "studioDisplayXDR", label: "Studio Display XDR", src: "https://assets.postspark.app/mockups/thumbnails/studio_display.webp" },
  { kind: "appleWatchSeries10", label: "Apple Watch Series 10", src: "https://assets.postspark.app/mockups/thumbnails/apple_watch_10_42mm_aluminum_sport_band.webp" },

] as const;

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
      .then(async (dataUrl) => {
        await manager.objects.addImage(dataUrl);
        void rememberRecentPhoto(dataUrl);
      })
      .catch((err) => {
        reportError(err, messages.errors.addImage);
      });
  };

  const fillFrameFromFile = (file: File) => {
    if (!file.type.startsWith("image/") || !manager) return;
    void fileToDataUrl(file)
      .then(async (dataUrl) => {
        await manager.objects.fillActiveFrame(dataUrl);
        void rememberRecentPhoto(dataUrl);
      })
      .catch((err) => {
        reportError(err, messages.errors.addImage);
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
        setUrlError(messages.errors.httpLink);
        return;
      }
    } catch {
      setUrlError(messages.errors.invalidLink);
      return;
    }

    setUrlError(null);
    setUrlLoading(true);
    try {
      const src = parsed.toString();
      await manager.objects.addImage(src);
      void rememberRecentPhoto(src);
      setImageUrl("");
    } catch (err) {
      reportError(err, messages.errors.loadImageCors);
      setUrlError(messages.errors.loadImageCors);
    } finally {
      setUrlLoading(false);
    }
  };

  const placeRecentPhoto = (src: string) => {
    if (!manager || !src) return;
    void manager.objects
      .addImage(src)
      .then(() => rememberRecentPhoto(src))
      .catch((err) => reportError(err, messages.errors.addImage));
  };

  const sections: ElementSection[] = useMemo(
    () => [
      {
        id: "elements-text",
        title: "Text",
        items: [
          { label: "Heading", icon: HeadingIcon , title: "Heading", action: () => manager?.objects.addHeading() },
          { label: "Subtitle", icon: SubtitleIcon , title: "Subtitle", action: () => manager?.objects.addSubtitle() },
          { label: "Paragraph", icon: ParagraphIcon , title: "Paragraph", action: () => manager?.objects.addParagraph() },
          { label: "Quote", icon: QuoteIcon , title: "Quote", action: () => manager?.objects.addQuote() },
        ],
      },
      {
        id: "elements-shapes",
        title: "Shapes",
        items: [
          { label: "Rectangle", icon: RectangleShapeIcon , action: () => manager?.objects.addRectangle() },
          { label: "Circle", icon: CircleShapeIcon , action: () => manager?.objects.addCircle() },
          { label: "Triangle", icon: TriangleShapeIcon , action: () => manager?.objects.addTriangle() },
          { label: "Diamond", icon: DiamondShapeIcon , action: () => manager?.objects.addDiamond() },
          { label: "Star", icon: StarShapeIcon , action: () => manager?.objects.addStar() },
          { label: "Hexagon", icon: HexagonShapeIcon , action: () => manager?.objects.addHexagon() },
          { label: "Ellipse", icon: EllipseShapeIcon , action: () => manager?.objects.addEllipse() },
          { label: "Line", icon: LineShapeIcon , action: () => manager?.objects.addLine() },
          { label: "Divider", icon: DividerShapeIcon , action: () => manager?.objects.addDividerLine() },
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
    placeRecentPhoto,
  };
}
