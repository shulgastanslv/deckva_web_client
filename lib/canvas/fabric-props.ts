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
];

for (const key of EXTRA) {
  if (!FabricObject.customProperties.includes(key)) {
    FabricObject.customProperties.push(key);
  }
}
