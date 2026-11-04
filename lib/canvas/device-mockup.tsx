import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import type { FrameKind } from "@/lib/canvas/frames";

/** Snapshot pixels per CSS pixel, чтобы устройство оставалось четким. */
export const MOCKUP_SCALE = 1;

interface DeviceSpec {
  width: number;
  height: number;
  screenBox: {
    x: number;
    y: number;
    w: number;
    h: number;
    radius: number;
  };
  frameUrl: string;
}

/** 
 * Точные размерности и координаты экрана для каждого типа мокапа.
 * Размеры подобраны под реальные пропорции PNG-шаблонов с assets.postspark.app.
 */
const DEVICE_CONFIGS: Record<FrameKind, DeviceSpec> = {
  iphone18pro: {
    width: 320, height: 650,
    screenBox: { x: 20, y: 20, w: 280, h: 610, radius: 40 },
    frameUrl: "https://assets.postspark.app/mockups/iphone_18_pro__burgundy_portrait.webp", 
  },
  iphone18promax: {
    width: 330, height: 670,
    screenBox: { x: 20, y: 20, w: 290, h: 630, radius: 42 },
    frameUrl: "https://assets.postspark.app/mockups/iphone_18_pro_max__burgundy_portrait.webp",
  },
  iphoneDuoClose: {
    width: 320, height: 650,
    screenBox: { x: 20, y: 20, w: 280, h: 610, radius: 36 },
    frameUrl: "https://assets.postspark.app/mockups/iphone_duo_closed__star_white_portrait.webp",
  },
  iphoneDuoOpen: {
    width: 650, height: 400, // Альбомный вариант (складной)
    screenBox: { x: 25, y: 25, w: 600, h: 350, radius: 24 },
    frameUrl: "https://assets.postspark.app/mockups/iphone_duo_open__star_white_landscape.webp",
  },
  iphone17pro: {
    width: 320, height: 650,
    screenBox: { x: 20, y: 20, w: 280, h: 610, radius: 40 },
    frameUrl: "https://assets.postspark.app/mockups/iphone_17_pro__deep_blue_portrait.webp",
  },
  iphone17promax: {
    width: 330, height: 670,
    screenBox: { x: 20, y: 20, w: 290, h: 630, radius: 42 },
    frameUrl: "https://assets.postspark.app/mockups/iphone_17_pro_max__deep_blue_portrait.webp",
  },
  iphoneAir: {
    width: 320, height: 650,
    screenBox: { x: 20, y: 20, w: 280, h: 610, radius: 40 },
    frameUrl: "https://assets.postspark.app/mockups/iphone_air__cloud_white_portrait.webp",
  },
  iphone17: {
    width: 320, height: 650,
    screenBox: { x: 20, y: 20, w: 280, h: 610, radius: 40 },
    frameUrl: "https://assets.postspark.app/mockups/iphone_17__black_portrait.webp",
  },
  iphone16pro: {
    width: 320, height: 650,
    screenBox: { x: 20, y: 20, w: 280, h: 610, radius: 40 },
    frameUrl: "https://assets.postspark.app/mockups/iphone_16_pro__natural_titanium_portrait.webp",
  },
  iphone16promax: {
    width: 330, height: 670,
    screenBox: { x: 20, y: 20, w: 290, h: 630, radius: 42 },
    frameUrl: "https://assets.postspark.app/mockups/iphone_16_pro_max__natural_titanium_portrait.webp",
  },
  iphone16: {
    width: 320, height: 650,
    screenBox: { x: 20, y: 20, w: 280, h: 610, radius: 40 },
    frameUrl: "https://assets.postspark.app/mockups/iphone_16__pink_portrait.webp",
  },
  iphone15pro: {
    width: 320, height: 650,
    screenBox: { x: 20, y: 20, w: 280, h: 610, radius: 40 },
    frameUrl: "https://assets.postspark.app/mockups/iphone_15_pro__natural_titanium_portrait.webp",
  },
  iphone15promax: {
    width: 330, height: 670,
    screenBox: { x: 20, y: 20, w: 290, h: 630, radius: 42 },
    frameUrl: "https://assets.postspark.app/mockups/iphone_15_pro_max__natural_titanium_portrait.webp",
  },
  iphone15: {
    width: 320, height: 650,
    screenBox: { x: 20, y: 20, w: 280, h: 610, radius: 40 },
    frameUrl: "https://assets.postspark.app/mockups/iphone_15__blue_portrait.webp",
  },
  iphone13: {
    width: 320, height: 650,
    screenBox: { x: 20, y: 20, w: 280, h: 610, radius: 40 },
    frameUrl: "https://assets.postspark.app/mockups/iphone_13__starnight_portrait.webp",
  },
  iphone13pro: {
    width: 320, height: 650,
    screenBox: { x: 20, y: 20, w: 280, h: 610, radius: 40 },
    frameUrl: "https://assets.postspark.app/mockups/iphone_13_pro__blue_portrait.webp",
  },
  android: {
    width: 320, height: 650,
    screenBox: { x: 20, y: 20, w: 280, h: 610, radius: 36 },
    frameUrl: "https://assets.postspark.app/mockups/pixel_7__hazel_portrait.webp",
  },
  ipadA16: {
    width: 650, height: 480,
    screenBox: { x: 30, y: 25, w: 590, h: 430, radius: 18 },
    frameUrl: "https://assets.postspark.app/mockups/ipad_a16__blue_landscape.webp",
  },
  ipadPro13M4: {
    width: 680, height: 480,
    screenBox: { x: 30, y: 25, w: 620, h: 430, radius: 18 },
    frameUrl: "https://assets.postspark.app/mockups/ipad_pro_13_m4__silver_landscape.webp",
  },
  ipadPro12: {
    width: 680, height: 500,
    screenBox: { x: 30, y: 25, w: 620, h: 450, radius: 18 },
    frameUrl: "https://assets.postspark.app/mockups/ipad_pro_12.9__gray_landscape.webp",
  },
  ipadAir: {
    width: 650, height: 480,
    screenBox: { x: 30, y: 25, w: 590, h: 430, radius: 18 },
    frameUrl: "https://assets.postspark.app/mockups/ipad_air__gray_landscape.webp",
  },
  ipadMini: {
    width: 450, height: 600,
    screenBox: { x: 25, y: 25, w: 400, h: 550, radius: 24 },
    frameUrl: "https://assets.postspark.app/mockups/ipad_mini__starlight_portrait.webp",
  },
  macbookAir13M5: {
    width: 700, height: 460,
    screenBox: { x: 45, y: 30, w: 610, h: 380, radius: 12 },
    frameUrl: "https://assets.postspark.app/mockups/macbook_air_13_m5__sky_blue_landscape.webp",
  },
  macbookAir15M5: {
    width: 750, height: 480,
    screenBox: { x: 50, y: 30, w: 650, h: 400, radius: 12 },
    frameUrl: "https://assets.postspark.app/mockups/macbook_air_15_m5__sky_blue_landscape.webp",
  },
  macbookneo: {
    width: 700, height: 460,
    screenBox: { x: 45, y: 30, w: 610, h: 380, radius: 12 },
    frameUrl: "https://assets.postspark.app/mockups/macbook_neo__citrus_landscape.webp",
  },
  macbookair13gen4: {
    width: 700, height: 460,
    screenBox: { x: 45, y: 30, w: 610, h: 380, radius: 12 },
    frameUrl: "https://assets.postspark.app/mockups/macbook_air_13_gen_4__midnight_landscape.webp",
  },
  imac24: {
    width: 750, height: 520,
    screenBox: { x: 35, y: 35, w: 680, h: 400, radius: 16 },
    frameUrl: "https://assets.postspark.app/mockups/imac_24__silver_landscape.webp",
  },
  proDisplayXDR: {
    width: 750, height: 480,
    screenBox: { x: 30, y: 30, w: 690, h: 420, radius: 8 },
    frameUrl: "https://assets.postspark.app/mockups/pro_display_xdr__silver_landscape.webp",
  },
  studioDisplayXDR: {
    width: 750, height: 480,
    screenBox: { x: 30, y: 30, w: 690, h: 420, radius: 8 },
    frameUrl: "https://assets.postspark.app/mockups/studio_display__silver_landscape.webp",
  },
  appleWatchSeries10: {
    width: 280, height: 350,
    screenBox: { x: 45, y: 45, w: 190, h: 260, radius: 50 },
    frameUrl: "https://assets.postspark.app/mockups/apple_watch_10_42mm_aluminum_sport_band__black_portrait.webp",
  },
};

function Screen({ src }: { src?: string }) {
  if (!src) {
    return <div style={{ width: "100%", height: "100%", background: "#e4e4e7" }} />;
  }
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
}

function Device({ kind, screen }: { kind: FrameKind; screen?: string }) {
  const config = DEVICE_CONFIGS[kind] || DEVICE_CONFIGS.iphone18pro;
  const { x, y, w, h, radius } = config.screenBox;

  return (
    <div style={{ position: "relative", width: config.width, height: config.height, display: "inline-block" }}>
      {/* Скриншот приложения внутри экрана устройства */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          borderRadius: radius,
          overflow: "hidden",
          background: "#000",
          zIndex: 1,
        }}
      >
        <Screen src={screen} />
      </div>

      {/* Реалистичный корпус устройства */}
      <img
        src={config.frameUrl}
        alt={kind}
        crossOrigin="anonymous"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
    </div>
  );
}

/** Cover-crops картинку под размеры экрана конкретного устройства. */
async function coverScreen(kind: FrameKind, source: string) {
  const config = DEVICE_CONFIGS[kind] || DEVICE_CONFIGS.iphone18pro;
  const pixelW = config.screenBox.w * MOCKUP_SCALE;
  const pixelH = config.screenBox.h * MOCKUP_SCALE;
  
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = source;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = pixelW;
  canvas.height = pixelH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return source;

  const scale = Math.max(pixelW / image.naturalWidth, pixelH / image.naturalHeight);
  const drawW = image.naturalWidth * scale;
  const drawH = image.naturalHeight * scale;
  ctx.drawImage(image, (pixelW - drawW) / 2, (pixelH - drawH) / 2, drawW, drawH);
  return canvas.toDataURL("image/png");
}

/**
 * Рендерит устройство с реалистичным PNG-мокапом в PNG-изображение.
 */
export async function renderDeviceMockup(kind: FrameKind, screen?: string) {
  const screenSrc = screen ? await coverScreen(kind, screen) : undefined;
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;left:-10000px;top:0;width:1400px;height:1800px;border:0;opacity:0;pointer-events:none";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const view = iframe.contentWindow;
  if (!doc || !view) {
    iframe.remove();
    throw new Error("Couldn't open a mockup frame");
  }

  doc.body.style.margin = "0";
  doc.body.style.background = "transparent";
  const host = doc.createElement("div");
  host.style.display = "inline-block";
  host.style.background = "transparent";
  doc.body.appendChild(host);

  const root = createRoot(host);
  try {
    flushSync(() => {
      root.render(<Device kind={kind} screen={screenSrc} />);
    });
    await Promise.all(
      [...host.querySelectorAll("img")].map((img) => img.decode().catch(() => undefined)),
    );
    const node = host.firstElementChild as HTMLElement | null;
    if (!node || node.offsetWidth < 2) {
      throw new Error("Mockup did not render");
    }

    const { default: html2canvas } = await import("html2canvas");
    const shot = await html2canvas(node, {
      backgroundColor: null,
      scale: MOCKUP_SCALE,
      logging: false,
      useCORS: true,
      allowTaint: true,
      windowWidth: view.innerWidth,
      windowHeight: view.innerHeight,
    });
    return shot.toDataURL("image/png");
  } finally {
    root.unmount();
    iframe.remove();
  }
}