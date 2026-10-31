export interface ProvenanceEvent {
  eventId: string;
  assetId: string;
  previousCustodian: string;
  newCustodian: string;
  location: string;
  notes: string;
  timestamp: string;
}

export interface AssetRecord {
  assetId: string;
  assetName: string;
  category: "Digital" | "Physical" | "Tokenized";
  creator: string;
  currentCustodian: string;
  status: "Registered" | "In Transit" | "Deployed" | "Archived";
  provenanceHistory: ProvenanceEvent[];
  createdAt: string;
}

export class AssetProvenanceRegistry {
  private assets: Map<string, AssetRecord> = new Map();

  /**
   * Register a new asset into the provenance ledger.
   */
  registerAsset(
    assetName: string,
    category: "Digital" | "Physical" | "Tokenized",
    creator: string,
    initialCustodian: string
  ): AssetRecord {
    const assetId = `AST-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const initialEvent: ProvenanceEvent = {
      eventId: crypto.randomUUID(),
      assetId,
      previousCustodian: "N/A (Creation)",
      newCustodian: initialCustodian,
      location: "Origin Vault",
      notes: "Asset initially registered and minted.",
      timestamp: new Date().toISOString(),
    };

    const asset: AssetRecord = {
      assetId,
      assetName,
      category,
      creator,
      currentCustodian: initialCustodian,
      status: "Registered",
      provenanceHistory: [initialEvent],
      createdAt: new Date().toISOString(),
    };

    this.assets.set(assetId, asset);
    return asset;
  }

  /**
   * Transfer custody of an asset and record the provenance event.
   */
  transferCustody(
    assetId: string,
    newCustodian: string,
    location: string,
    notes: string
  ): { success: boolean; asset?: AssetRecord; message: string } {
    const asset = this.assets.get(assetId);
    if (!asset) {
      return { success: false, message: "Asset not found in provenance registry." };
    }

    const event: ProvenanceEvent = {
      eventId: crypto.randomUUID(),
      assetId,
      previousCustodian: asset.currentCustodian,
      newCustodian,
      location,
      notes,
      timestamp: new Date().toISOString(),
    };

    asset.currentCustodian = newCustodian;
    asset.status = "In Transit";
    asset.provenanceHistory.push(event);
    this.assets.set(assetId, asset);

    return { success: true, asset, message: "Custody transferred and logged successfully." };
  }

  /**
   * Retrieve asset details and complete audit trail.
   */
  getAsset(assetId: string): AssetRecord | undefined {
    return this.assets.get(assetId);
  }

  /**
   * List all registered assets.
   */
  getAllAssets(): AssetRecord[] {
    return Array.from(this.assets.values());
  }
}

export const assetProvenanceRegistry = new AssetProvenanceRegistry();
