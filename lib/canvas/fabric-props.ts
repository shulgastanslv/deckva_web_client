import { FabricObject } from "fabric";

/** Extra fields Fabric must keep in `toJSON` / `loadFromJSON`. */
const EXTRA = [
  "swibpRole",
  "swibpNumberStyle",
  "swibpStyle",
  "swibpSlot",
  "swibpFrameKind",
  "swibpIcon",
  "swibpMask",
  "swibpName",
  "swibpId",
  "swibpLocked",
  "swibpCode",
  "swibpCodeLang",
  "swibpCodeTheme",
  "swibpCodePadding",
  "swibpCodeRadius",
  "swibpCodeFontSize",
  "swibpCodeChrome",
  "swibpCodeLineNumbers",
  "swibpCodeFilename",
  "swibpCodeDarkMode",
  "swibpCodeBackground",
  "swibpCodeTransparent",
  "swibpBaseScaleX",
  "swibpBaseScaleY",
  /** Figma-like text resize: auto-width | auto-height | fixed */
  "swibpTextResize",
  /** Legacy: true ≈ auto-width. Prefer swibpTextResize. */
  "swibpFitWidth",
  /** Stable CORA object binding id from deckva_ai assemble. */
  "coraObjectId",
];

for (const key of EXTRA) {
  if (!FabricObject.customProperties.includes(key)) {
    FabricObject.customProperties.push(key);
  }
}
