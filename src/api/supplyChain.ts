import { assetProvenanceRegistry } from "../core/AssetProvenance";
import { logisticsTracker, ShipmentStatus } from "../core/LogisticsTracker";

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export class SupplyChainAPIHandler {
  /**
   * Register a new asset.
   * POST /api/supply-chain/assets
   */
  static registerAsset(body: {
    assetName: string;
    category: "Digital" | "Physical" | "Tokenized";
    creator: string;
    initialCustodian: string;
  }): APIResponse<any> {
    if (!body.assetName || !body.category || !body.creator) {
      return {
        success: false,
        error: "Missing required fields: assetName, category, or creator.",
        timestamp: new Date().toISOString(),
      };
    }

    const asset = assetProvenanceRegistry.registerAsset(
      body.assetName,
      body.category,
      body.creator,
      body.initialCustodian || body.creator
    );

    return {
      success: true,
      data: asset,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Transfer asset custody.
   * POST /api/supply-chain/transfer
   */
  static transferCustody(body: {
    assetId: string;
    newCustodian: string;
    location: string;
    notes: string;
  }): APIResponse<any> {
    const result = assetProvenanceRegistry.transferCustody(
      body.assetId,
      body.newCustodian,
      body.location,
      body.notes
    );

    if (!result.success) {
      return {
        success: false,
        error: result.message,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: result.asset,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create a shipment.
   * POST /api/supply-chain/shipments
   */
  static createShipment(body: {
    assetId: string;
    destination: string;
    carrier: string;
    estimatedDeliveryDays: number;
  }): APIResponse<any> {
    const asset = assetProvenanceRegistry.getAsset(body.assetId);
    if (!asset) {
      return {
        success: false,
        error: "Asset not found for shipment.",
        timestamp: new Date().toISOString(),
      };
    }

    const shipment = logisticsTracker.createShipment(
      body.assetId,
      body.destination,
      body.carrier,
      body.estimatedDeliveryDays || 3
    );

    return {
      success: true,
      data: shipment,
      timestamp: new Date().toISOString(),
    };
  }
}
