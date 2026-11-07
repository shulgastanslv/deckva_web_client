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

/** Inset screen slightly inside the bezel so content never bleeds over chrome. */
function insetBox(
  width: number,
  height: number,
  opts: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    radius: number;
    pad?: number;
  },
) {
  const pad = opts.pad ?? 1;
  const x = Math.round(opts.left + pad);
  const y = Math.round(opts.top + pad);
  const w = Math.max(8, Math.round(width - opts.left - opts.right - pad * 2));
  const h = Math.max(8, Math.round(height - opts.top - opts.bottom - pad * 2));
  return {
    x,
    y,
    w,
    h,
    radius: Math.max(4, Math.round(opts.radius - pad)),
  };
}

/** Modern iPhone / Android portrait mockups — nearly edge-to-edge display. */
function phonePortrait(width: number, height: number, radius = 47): DeviceSpec["screenBox"] {
  return insetBox(width, height, {
    left: width * 0.052,
    top: height * 0.025,
    right: width * 0.052,
    bottom: height * 0.025,
    radius,
  });
}

function phoneLandscape(width: number, height: number, radius = 28): DeviceSpec["screenBox"] {
  return insetBox(width, height, {
    left: width * 0.03,
    top: height * 0.055,
    right: width * 0.03,
    bottom: height * 0.055,
    radius,
  });
}

function tabletLandscape(width: number, height: number, radius = 16): DeviceSpec["screenBox"] {
  return insetBox(width, height, {
    left: width * 0.038,
    top: height * 0.042,
    right: width * 0.038,
    bottom: height * 0.042,
    radius,
  });
}

function tabletPortrait(width: number, height: number, radius = 22): DeviceSpec["screenBox"] {
  return insetBox(width, height, {
    left: width * 0.045,
    top: height * 0.035,
    right: width * 0.045,
    bottom: height * 0.035,
    radius,
  });
}

/** Laptop: screen sits above the keyboard deck. */
function laptopScreen(width: number, height: number, radius = 8): DeviceSpec["screenBox"] {
  return insetBox(width, height, {
    left: width * 0.118,
    top: height * 0.052,
    right: width * 0.118,
    bottom: height * 0.265,
    radius,
    pad: 1,
  });
}

function displayScreen(width: number, height: number, radius = 10): DeviceSpec["screenBox"] {
  return insetBox(width, height, {
    left: width * 0.04,
    top: height * 0.055,
    right: width * 0.04,
    bottom: height * 0.145,
    radius,
  });
}

function watchScreen(width: number, height: number, radius = 48): DeviceSpec["screenBox"] {
  return insetBox(width, height, {
    left: width * 0.16,
    top: height * 0.145,
    right: width * 0.16,
    bottom: height * 0.145,
    radius,
    pad: 0,
  });
}

/**
 * Точные размерности и координаты экрана для каждого типа мокапа.
 * screenBox считается процентами от размера кадра — экраны ровно садятся в рамку.
 */
const DEVICE_CONFIGS: Record<FrameKind, DeviceSpec> = {
  iphone18pro: {
    width: 320,
    height: 650,
    screenBox: phonePortrait(320, 650, 48),
    frameUrl: "https://assets.postspark.app/mockups/iphone_18_pro__burgundy_portrait.webp",
  },
  iphone18promax: {
    width: 330,
    height: 670,
    screenBox: phonePortrait(330, 670, 50),
    frameUrl: "https://assets.postspark.app/mockups/iphone_18_pro_max__burgundy_portrait.webp",
  },
  iphoneDuoClose: {
    width: 320,
    height: 650,
    screenBox: phonePortrait(320, 650, 40),
    frameUrl: "https://assets.postspark.app/mockups/iphone_duo_closed__star_white_portrait.webp",
  },
  iphoneDuoOpen: {
    width: 650,
    height: 400,
    screenBox: phoneLandscape(650, 400, 26),
    frameUrl: "https://assets.postspark.app/mockups/iphone_duo_open__star_white_landscape.webp",
  },
  iphone17pro: {
    width: 320,
    height: 650,
    screenBox: phonePortrait(320, 650, 48),
    frameUrl: "https://assets.postspark.app/mockups/iphone_17_pro__deep_blue_portrait.webp",
  },
  iphone17promax: {
    width: 330,
    height: 670,
    screenBox: phonePortrait(330, 670, 50),
    frameUrl: "https://assets.postspark.app/mockups/iphone_17_pro_max__deep_blue_portrait.webp",
  },
  iphoneAir: {
    width: 320,
    height: 650,
    screenBox: phonePortrait(320, 650, 48),
    frameUrl: "https://assets.postspark.app/mockups/iphone_air__cloud_white_portrait.webp",
  },
  iphone17: {
    width: 320,
    height: 650,
    screenBox: phonePortrait(320, 650, 48),
    frameUrl: "https://assets.postspark.app/mockups/iphone_17__black_portrait.webp",
  },
  iphone16pro: {
    width: 320,
    height: 650,
    screenBox: phonePortrait(320, 650, 47),
    frameUrl: "https://assets.postspark.app/mockups/iphone_16_pro__natural_titanium_portrait.webp",
  },
  iphone16promax: {
    width: 330,
    height: 670,
    screenBox: phonePortrait(330, 670, 49),
    frameUrl: "https://assets.postspark.app/mockups/iphone_16_pro_max__natural_titanium_portrait.webp",
  },
  iphone16: {
    width: 320,
    height: 650,
    screenBox: phonePortrait(320, 650, 48),
    frameUrl: "https://assets.postspark.app/mockups/iphone_16__pink_portrait.webp",
  },
  iphone15pro: {
    width: 320,
    height: 650,
    screenBox: phonePortrait(320, 650, 47),
    frameUrl: "https://assets.postspark.app/mockups/iphone_15_pro__natural_titanium_portrait.webp",
  },
  iphone15promax: {
    width: 330,
    height: 670,
    screenBox: phonePortrait(330, 670, 49),
    frameUrl: "https://assets.postspark.app/mockups/iphone_15_pro_max__natural_titanium_portrait.webp",
  },
  iphone15: {
    width: 320,
    height: 650,
    screenBox: phonePortrait(320, 650, 48),
    frameUrl: "https://assets.postspark.app/mockups/iphone_15__blue_portrait.webp",
  },
  iphone13: {
    width: 320,
    height: 650,
    screenBox: phonePortrait(320, 650, 44),
    frameUrl: "https://assets.postspark.app/mockups/iphone_13__starnight_portrait.webp",
  },
  iphone13pro: {
    width: 320,
    height: 650,
    screenBox: phonePortrait(320, 650, 44),
    frameUrl: "https://assets.postspark.app/mockups/iphone_13_pro__blue_portrait.webp",
  },
  android: {
    width: 320,
    height: 650,
    screenBox: phonePortrait(320, 650, 36),
    frameUrl: "https://assets.postspark.app/mockups/pixel_7__hazel_portrait.webp",
  },
  ipadA16: {
    width: 650,
    height: 480,
    screenBox: tabletLandscape(650, 480, 18),
    frameUrl: "https://assets.postspark.app/mockups/ipad_a16__blue_landscape.webp",
  },
  ipadPro13M4: {
    width: 680,
    height: 480,
    screenBox: tabletLandscape(680, 480, 18),
    frameUrl: "https://assets.postspark.app/mockups/ipad_pro_13_m4__silver_landscape.webp",
  },
  ipadPro12: {
    width: 680,
    height: 500,
    screenBox: tabletLandscape(680, 500, 18),
    frameUrl: "https://assets.postspark.app/mockups/ipad_pro_12.9__gray_landscape.webp",
  },
  ipadAir: {
    width: 650,
    height: 480,
    screenBox: tabletLandscape(650, 480, 18),
    frameUrl: "https://assets.postspark.app/mockups/ipad_air__gray_landscape.webp",
  },
  ipadMini: {
    width: 450,
    height: 600,
    screenBox: tabletPortrait(450, 600, 24),
    frameUrl: "https://assets.postspark.app/mockups/ipad_mini__starlight_portrait.webp",
  },
  macbookAir13M5: {
    width: 700,
    height: 460,
    screenBox: laptopScreen(700, 460),
    frameUrl: "https://assets.postspark.app/mockups/macbook_air_13_m5__sky_blue_landscape.webp",
  },
  macbookAir15M5: {
    width: 750,
    height: 480,
    screenBox: laptopScreen(750, 480),
    frameUrl: "https://assets.postspark.app/mockups/macbook_air_15_m5__sky_blue_landscape.webp",
  },
  macbookneo: {
    width: 700,
    height: 460,
    screenBox: laptopScreen(700, 460),
    frameUrl: "https://assets.postspark.app/mockups/macbook_neo__citrus_landscape.webp",
  },
  macbookair13gen4: {
    width: 700,
    height: 460,
    screenBox: laptopScreen(700, 460),
    frameUrl: "https://assets.postspark.app/mockups/macbook_air_13_gen_4__midnight_landscape.webp",
  },
  imac24: {
    width: 750,
    height: 520,
    screenBox: displayScreen(750, 520, 14),
    frameUrl: "https://assets.postspark.app/mockups/imac_24__silver_landscape.webp",
  },
  proDisplayXDR: {
    width: 750,
    height: 480,
    screenBox: displayScreen(750, 480, 6),
    frameUrl: "https://assets.postspark.app/mockups/pro_display_xdr__silver_landscape.webp",
  },
  studioDisplayXDR: {
    width: 750,
    height: 480,
    screenBox: displayScreen(750, 480, 6),
    frameUrl: "https://assets.postspark.app/mockups/studio_display__silver_landscape.webp",
  },
  appleWatchSeries10: {
    width: 280,
    height: 350,
    screenBox: watchScreen(280, 350, 52),
    frameUrl:
      "https://assets.postspark.app/mockups/apple_watch_10_42mm_aluminum_sport_band__black_portrait.webp",
  },
};

/** Logical screen size shown in the frames picker (approx CSS points). */
export function getDeviceScreenSize(kind: FrameKind): { width: number; height: number } {
  const config = DEVICE_CONFIGS[kind] ?? DEVICE_CONFIGS.iphone18pro;
  const key = kind.toLowerCase();
  const scale = key.includes("ipad")
    ? 2.6
    : key.includes("mac") || key.includes("imac") || key.includes("display")
      ? 3.2
      : key.includes("watch")
        ? 1.4
        : 1.44;
  return {
    width: Math.round(config.screenBox.w * scale),
    height: Math.round(config.screenBox.h * scale),
  };
}

function Screen({ src }: { src?: string }) {
  if (!src) {
    return <div style={{ width: "100%", height: "100%", background: "#e4e4e7" }} />;
  }
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
        display: "block",
      }}
    />
  );
}

function Device({ kind, screen }: { kind: FrameKind; screen?: string }) {
  const config = DEVICE_CONFIGS[kind] || DEVICE_CONFIGS.iphone18pro;
  const { x, y, w, h, radius } = config.screenBox;

  return (
    <div
      style={{
        position: "relative",
        width: config.width,
        height: config.height,
        display: "inline-block",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          borderRadius: radius,
          overflow: "hidden",
          background: "#111",
          zIndex: 1,
        }}
      >
        <Screen src={screen} />
      </div>

      {/* Fill the authored box so screenBox stays aligned across devices */}
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
          objectFit: "fill",
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
  const pixelW = Math.max(1, Math.round(config.screenBox.w * MOCKUP_SCALE));
  const pixelH = Math.max(1, Math.round(config.screenBox.h * MOCKUP_SCALE));

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
