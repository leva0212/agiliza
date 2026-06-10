export type InventoryMovement = {

  id: string;

  quantity_before: number;

  quantity_change: number;

  quantity_after: number;

  reason: string;

  notes: string | null;

  created_at: string;

};