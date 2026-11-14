import type { ConnectorProviderId } from "@/lib/connectors/types";

export type ConnectorCatalogItem = {
  id: ConnectorProviderId;
  brand: "googledrive";
  label: string;
  description: string;
  capabilities: string[];
};

export const CONNECTOR_CATALOG: ConnectorCatalogItem[] = [
  {
    id: "google-drive",
    brand: "googledrive",
    label: "Google Drive",
    description: "Import images and brand assets from Drive into the studio.",
    capabilities: ["import", "sync"],
  },
];

export function connectorCatalogItem(
  id: ConnectorProviderId,
): ConnectorCatalogItem {
  const item = CONNECTOR_CATALOG.find((entry) => entry.id === id);
  if (!item) throw new Error(`Unknown connector: ${id}`);
  return item;
}
