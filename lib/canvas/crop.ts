/** Largest source window that keeps `ratio` (width / height) and still covers the frame. */
export function largestWindow(naturalW: number, naturalH: number, ratio: number) {
  const safeRatio = ratio > 0 ? ratio : 1;
  if (naturalW <= 0 || naturalH <= 0) return { width: 1, height: 1 };
  if (naturalW / naturalH >= safeRatio) {
    const height = naturalH;
    return { width: height * safeRatio, height };
  }
  const width = naturalW;
  return { width, height: width / safeRatio };
}

export function windowAtZoom(cover: { width: number; height: number }, zoom: number) {
  const z = Math.max(zoom, 1);
  return { width: cover.width / z, height: cover.height / z };
}

/** Keeps the source window inside the photo. */
export function placeWindow(
  centerX: number,
  centerY: number,
  windowW: number,
  windowH: number,
  naturalW: number,
  naturalH: number,
) {
  const width = Math.min(Math.max(windowW, 1), naturalW);
  const height = Math.min(Math.max(windowH, 1), naturalH);
  const cropX = clamp(centerX - width / 2, 0, Math.max(0, naturalW - width));
  const cropY = clamp(centerY - height / 2, 0, Math.max(0, naturalH - height));
  return { cropX, cropY, width, height };
}

/**
 * Scene drag → source pixels. Dragging the picture right reveals what was on its left,
 * so the caller subtracts this from the crop / pan center.
 */
export function sourceDelta(
  dx: number,
  dy: number,
  angleDeg: number,
  scaleX: number,
  scaleY: number,
  flipX: boolean,
  flipY: boolean,
) {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  let localX = dx * cos + dy * sin;
  let localY = -dx * sin + dy * cos;
  if (flipX) localX = -localX;
  if (flipY) localY = -localY;
  return {
    x: localX / (scaleX || 1),
    y: localY / (scaleY || 1),
  };
}

/** Source-pixel offset → scene delta (inverse of sourceDelta). */
export function sceneDelta(
  srcX: number,
  srcY: number,
  angleDeg: number,
  scaleX: number,
  scaleY: number,
  flipX: boolean,
  flipY: boolean,
) {
  let localX = srcX * (scaleX || 1);
  let localY = srcY * (scaleY || 1);
  if (flipX) localX = -localX;
  if (flipY) localY = -localY;
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: localX * cos - localY * sin,
    y: localX * sin + localY * cos,
  };
}

/**
 * Where the frame sits in source space for an expanded (cropX=0) image.
 * Image and frame share the same angle / flips.
 */
export function frameInSource(
  imgCenter: { x: number; y: number },
  frameCenter: { x: number; y: number },
  frameW: number,
  frameH: number,
  naturalW: number,
  naturalH: number,
  angleDeg: number,
  scaleX: number,
  scaleY: number,
  flipX: boolean,
  flipY: boolean,
) {
  const delta = sourceDelta(
    frameCenter.x - imgCenter.x,
    frameCenter.y - imgCenter.y,
    angleDeg,
    scaleX,
    scaleY,
    flipX,
    flipY,
  );
  const srcW = frameW / (scaleX || 1);
  const srcH = frameH / (scaleY || 1);
  return placeWindow(
    naturalW / 2 + delta.x,
    naturalH / 2 + delta.y,
    srcW,
    srcH,
    naturalW,
    naturalH,
  );
}

/** Push image center so the frame stays covered by the photo. */
export function clampImageCenterToCover(
  imgCenter: { x: number; y: number },
  frameCenter: { x: number; y: number },
  frameW: number,
  frameH: number,
  naturalW: number,
  naturalH: number,
  angleDeg: number,
  scaleX: number,
  scaleY: number,
  flipX: boolean,
  flipY: boolean,
) {
  const placed = frameInSource(
    imgCenter,
    frameCenter,
    frameW,
    frameH,
    naturalW,
    naturalH,
    angleDeg,
    scaleX,
    scaleY,
    flipX,
    flipY,
  );
  const desiredSrcCx = placed.cropX + placed.width / 2;
  const desiredSrcCy = placed.cropY + placed.height / 2;
  const current = sourceDelta(
    frameCenter.x - imgCenter.x,
    frameCenter.y - imgCenter.y,
    angleDeg,
    scaleX,
    scaleY,
    flipX,
    flipY,
  );
  const currentSrcCx = naturalW / 2 + current.x;
  const currentSrcCy = naturalH / 2 + current.y;
  const fix = sceneDelta(
    desiredSrcCx - currentSrcCx,
    desiredSrcCy - currentSrcCy,
    angleDeg,
    scaleX,
    scaleY,
    flipX,
    flipY,
  );
  // Image must move opposite to the source-center fix relative to the fixed frame.
  return {
    x: imgCenter.x - fix.x,
    y: imgCenter.y - fix.y,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
