import type { FrameKind } from "@/lib/canvas/frames";

/** Snapshot pixels per CSS pixel. 3× keeps the bezel sharp when the frame is scaled on the slide. */
export const MOCKUP_SCALE = 3;

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
 * Screen hole measured from each mockup PNG (alpha hole vs full image).
 * Insets are fractions of the authored box (object-fit: fill).
 * `pad` is kept for rare per-device overrides; default is flush to the screen hole.
 */
function screenBox(
  width: number,
  height: number,
  insets: { left: number; top: number; right: number; bottom: number },
  radius: number,
  pad = 0,
) {
  const left = Math.round(width * (insets.left + pad));
  const top = Math.round(height * (insets.top + pad));
  const right = Math.round(width * (insets.right + pad));
  const bottom = Math.round(height * (insets.bottom + pad));
  return {
    x: left,
    y: top,
    w: Math.max(8, width - left - right),
    h: Math.max(8, height - top - bottom),
    radius: Math.max(4, Math.round(radius - width * pad)),
  };
}

/** Modern iPhone / Android — nearly edge-to-edge glass. */
const PHONE = { left: 0.054, top: 0.025, right: 0.054, bottom: 0.025 };
const PHONE_AIR = { left: 0.044, top: 0.025, right: 0.044, bottom: 0.025 };
const PHONE_DUO = { left: 0.056, top: 0.037, right: 0.056, bottom: 0.037 };
const PHONE_LANDSCAPE = { left: 0.039, top: 0.054, right: 0.039, bottom: 0.054 };
const ANDROID = { left: 0.056, top: 0.028, right: 0.056, bottom: 0.028 };

const TABLET_LANDSCAPE = { left: 0.042, top: 0.052, right: 0.042, bottom: 0.052 };
const TABLET_PORTRAIT = { left: 0.07, top: 0.05, right: 0.07, bottom: 0.048 };

/** MacBooks: measured holes — top was too small (5%) and spilled over the lid. */
const MACBOOK_AIR_13 = { left: 0.124, top: 0.129, right: 0.124, bottom: 0.129 };
const MACBOOK_AIR_15 = { left: 0.093, top: 0.095, right: 0.094, bottom: 0.095 };
const MACBOOK_AIR_13_GEN4 = { left: 0.103, top: 0.104, right: 0.103, bottom: 0.104 };
const MACBOOK_NEO = { left: 0.126, top: 0.143, right: 0.126, bottom: 0.143 };

const IMAC = { left: 0.041, top: 0.046, right: 0.041, bottom: 0.349 };
const PRO_DISPLAY = { left: 0.024, top: 0.032, right: 0.024, bottom: 0.259 };
const STUDIO_DISPLAY = { left: 0.021, top: 0.027, right: 0.021, bottom: 0.271 };
const WATCH = { left: 0.128, top: 0.215, right: 0.128, bottom: 0.215 };

/**
 * Точные размерности и координаты экрана для каждого типа мокапа.
 * screenBox считается процентами от размера кадра — экраны ровно садятся в рамку.
 */
const DEVICE_CONFIGS: Record<FrameKind, DeviceSpec> = {
  iphone18pro: {
    width: 320,
    height: 650,
    screenBox: screenBox(320, 650, PHONE, 48),
    frameUrl: "/mockups/iphone_18_pro__burgundy_portrait.webp",
  },
  iphone18promax: {
    width: 330,
    height: 670,
    screenBox: screenBox(330, 670, PHONE, 50),
    frameUrl: "/mockups/iphone_18_pro_max__burgundy_portrait.webp",
  },
  iphoneDuoClose: {
    width: 320,
    height: 650,
    screenBox: screenBox(320, 650, PHONE_DUO, 40),
    frameUrl: "/mockups/iphone_duo_closed__star_white_portrait.webp",
  },
  iphoneDuoOpen: {
    width: 650,
    height: 400,
    screenBox: screenBox(650, 400, PHONE_LANDSCAPE, 26),
    frameUrl: "/mockups/iphone_duo_open__star_white_landscape.webp",
  },
  iphone17pro: {
    width: 320,
    height: 650,
    screenBox: screenBox(320, 650, PHONE, 48),
    frameUrl: "/mockups/iphone_17_pro__deep_blue_portrait.webp",
  },
  iphone17promax: {
    width: 330,
    height: 670,
    screenBox: screenBox(330, 670, PHONE, 50),
    frameUrl: "/mockups/iphone_17_pro_max__deep_blue_portrait.webp",
  },
  iphoneAir: {
    width: 320,
    height: 650,
    screenBox: screenBox(320, 650, PHONE_AIR, 48),
    frameUrl: "/mockups/iphone_air__cloud_white_portrait.webp",
  },
  iphone17: {
    width: 320,
    height: 650,
    screenBox: screenBox(320, 650, PHONE, 48),
    frameUrl: "/mockups/iphone_17__black_portrait.webp",
  },
  iphone16pro: {
    width: 320,
    height: 650,
    screenBox: screenBox(320, 650, PHONE, 47),
    frameUrl: "/mockups/iphone_16_pro__natural_titanium_portrait.webp",
  },
  iphone16promax: {
    width: 330,
    height: 670,
    screenBox: screenBox(330, 670, PHONE, 49),
    frameUrl: "/mockups/iphone_16_pro_max__natural_titanium_portrait.webp",
  },
  iphone16: {
    width: 320,
    height: 650,
    screenBox: screenBox(320, 650, PHONE, 48),
    frameUrl: "/mockups/iphone_16__pink_portrait.webp",
  },
  iphone15pro: {
    width: 320,
    height: 650,
    screenBox: screenBox(320, 650, PHONE, 47),
    frameUrl: "/mockups/iphone_15_pro__natural_titanium_portrait.webp",
  },
  iphone15promax: {
    width: 330,
    height: 670,
    screenBox: screenBox(330, 670, PHONE, 49),
    frameUrl: "/mockups/iphone_15_pro_max__natural_titanium_portrait.webp",
  },
  iphone15: {
    width: 320,
    height: 650,
    screenBox: screenBox(320, 650, PHONE, 48),
    frameUrl: "/mockups/iphone_15__blue_portrait.webp",
  },
  iphone13: {
    width: 320,
    height: 650,
    screenBox: screenBox(320, 650, PHONE, 44),
    frameUrl: "/mockups/iphone_13__starnight_portrait.webp",
  },
  iphone13pro: {
    width: 320,
    height: 650,
    screenBox: screenBox(320, 650, PHONE, 44),
    frameUrl: "/mockups/iphone_13_pro__blue_portrait.webp",
  },
  android: {
    width: 320,
    height: 650,
    screenBox: screenBox(320, 650, ANDROID, 36),
    frameUrl: "/mockups/pixel_7__hazel_portrait.webp",
  },
  ipadA16: {
    width: 650,
    height: 480,
    screenBox: screenBox(650, 480, TABLET_LANDSCAPE, 18),
    frameUrl: "/mockups/ipad_a16__blue_landscape.webp",
  },
  ipadPro13M4: {
    width: 680,
    height: 480,
    screenBox: screenBox(680, 480, TABLET_LANDSCAPE, 18),
    frameUrl: "/mockups/ipad_pro_13_m4__silver_landscape.webp",
  },
  ipadPro12: {
    width: 680,
    height: 500,
    screenBox: screenBox(680, 500, TABLET_LANDSCAPE, 18),
    frameUrl: "/mockups/ipad_pro_12.9__gray_landscape.webp",
  },
  ipadAir: {
    width: 650,
    height: 480,
    screenBox: screenBox(650, 480, TABLET_LANDSCAPE, 18),
    frameUrl: "/mockups/ipad_air__gray_landscape.webp",
  },
  ipadMini: {
    width: 450,
    height: 600,
    screenBox: screenBox(450, 600, TABLET_PORTRAIT, 24),
    frameUrl: "/mockups/ipad_mini__starlight_portrait.webp",
  },
  macbookAir13M5: {
    width: 700,
    height: 460,
    screenBox: screenBox(700, 460, MACBOOK_AIR_13, 8),
    frameUrl: "/mockups/macbook_air_13_m5__sky_blue_landscape.webp",
  },
  macbookAir15M5: {
    width: 750,
    height: 480,
    screenBox: screenBox(750, 480, MACBOOK_AIR_15, 8),
    frameUrl: "/mockups/macbook_air_15_m5__sky_blue_landscape.webp",
  },
  macbookneo: {
    width: 700,
    height: 460,
    screenBox: screenBox(700, 460, MACBOOK_NEO, 8),
    frameUrl: "/mockups/macbook_neo__citrus_landscape.webp",
  },
  macbookair13gen4: {
    width: 700,
    height: 460,
    screenBox: screenBox(700, 460, MACBOOK_AIR_13_GEN4, 8),
    frameUrl: "/mockups/macbook_air_13_gen_4__midnight_landscape.webp",
  },
  imac24: {
    width: 750,
    height: 520,
    screenBox: screenBox(750, 520, IMAC, 14),
    frameUrl: "/mockups/imac_24__silver_landscape.webp",
  },
  proDisplayXDR: {
    width: 750,
    height: 480,
    screenBox: screenBox(750, 480, PRO_DISPLAY, 6),
    frameUrl: "/mockups/pro_display_xdr__silver_landscape.webp",
  },
  studioDisplayXDR: {
    width: 750,
    height: 480,
    screenBox: screenBox(750, 480, STUDIO_DISPLAY, 6),
    frameUrl: "/mockups/studio_display__silver_landscape.webp",
  },
  appleWatchSeries10: {
    width: 280,
    height: 350,
    screenBox: screenBox(280, 350, WATCH, 52, 0),
    frameUrl:
      "/mockups/apple_watch_10_42mm_aluminum_sport_band__black_portrait.webp",
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

function loadImage(src: string) {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = src;
  return image.decode().then(() => image);
}

/**
 * Draws the device frame onto a canvas at MOCKUP_SCALE.
 * The screen is a square fill tucked under the bezel. The frame PNG
 * supplies the rounded hole, so a rounded clip cannot leave a gap.
 */
export async function renderDeviceMockup(kind: FrameKind, screen?: string) {
  const config = DEVICE_CONFIGS[kind] || DEVICE_CONFIGS.iphone18pro;
  const frame = await loadImage(config.frameUrl);
  const width = Math.max(1, Math.round(config.width * MOCKUP_SCALE));
  const height = Math.max(1, Math.round(config.height * MOCKUP_SCALE));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't open a mockup frame");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const { x, y, w, h } = config.screenBox;
  const bleed = 2 * MOCKUP_SCALE;
  const sx = x * MOCKUP_SCALE - bleed;
  const sy = y * MOCKUP_SCALE - bleed;
  const sw = w * MOCKUP_SCALE + bleed * 2;
  const sh = h * MOCKUP_SCALE + bleed * 2;

  if (screen) {
    try {
      const shot = await loadImage(screen);
      const cover = Math.max(sw / shot.naturalWidth, sh / shot.naturalHeight);
      const dw = shot.naturalWidth * cover;
      const dh = shot.naturalHeight * cover;
      ctx.drawImage(shot, sx + (sw - dw) / 2, sy + (sh - dh) / 2, dw, dh);
    } catch {
      ctx.fillStyle = "#e4e4e7";
      ctx.fillRect(sx, sy, sw, sh);
    }
  } else {
    ctx.fillStyle = "#e4e4e7";
    ctx.fillRect(sx, sy, sw, sh);
  }

  ctx.drawImage(frame, 0, 0, width, height);
  return canvas.toDataURL("image/png");
}
