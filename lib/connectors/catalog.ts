import type { ConnectorProviderId } from "@/lib/connectors/types";

export type ConnectorCatalogItem = {
  id: ConnectorProviderId;
  brand: "threads" | "googledrive";
  label: string;
  description: string;
  capabilities: string[];
};

/** Product catalog — Threads replaces Pinterest; Drive for file import. */
export const CONNECTOR_CATALOG: ConnectorCatalogItem[] = [
  {
    id: "google-drive",
    brand: "googledrive",
    label: "Google Drive",
    description: "Import images and brand assets from Drive into the studio.",
    capabilities: ["import", "sync"],
  },
  {
    id: "threads",
    brand: "threads",
    label: "Threads",
    description: "Publish carousels and pull post insights from Threads.",
    capabilities: ["publish", "insights"],
  },
];

export function connectorCatalogItem(
  id: ConnectorProviderId,
): ConnectorCatalogItem {
  const item = CONNECTOR_CATALOG.find((entry) => entry.id === id);
  if (!item) throw new Error(`Unknown connector: ${id}`);
  return item;
}
