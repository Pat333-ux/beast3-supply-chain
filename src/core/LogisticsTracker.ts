export type ShipmentStatus = "Dispatched" | "In Transit" | "Delivered" | "Delayed";

export interface Shipment {
  shipmentId: string;
  assetId: string;
  destination: string;
  carrier: string;
  status: ShipmentStatus;
  estimatedDelivery: string;
  updatedAt: string;
}

export class LogisticsTracker {
  private shipments: Map<string, Shipment> = new Map();

  /**
   * Create a dispatch shipment for an asset.
   */
  createShipment(
    assetId: string,
    destination: string,
    carrier: string,
    estimatedDeliveryDays: number
  ): Shipment {
    const shipmentId = `SHP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + estimatedDeliveryDays);

    const shipment: Shipment = {
      shipmentId,
      assetId,
      destination,
      carrier,
      status: "Dispatched",
      estimatedDelivery: deliveryDate.toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.shipments.set(shipmentId, shipment);
    return shipment;
  }

  /**
   * Update the status of a shipment.
   */
  updateShipmentStatus(shipmentId: string, status: ShipmentStatus): Shipment | undefined {
    const shipment = this.shipments.get(shipmentId);
    if (!shipment) return undefined;

    shipment.status = status;
    shipment.updatedAt = new Date().toISOString();
    this.shipments.set(shipmentId, shipment);
    return shipment;
  }

  /**
   * Get shipment details by ID.
   */
  getShipment(shipmentId: string): Shipment | undefined {
    return this.shipments.get(shipmentId);
  }

  /**
   * Get all active shipments.
   */
  getActiveShipments(): Shipment[] {
    return Array.from(this.shipments.values()).filter((s) => s.status !== "Delivered");
  }
}

export const logisticsTracker = new LogisticsTracker();
