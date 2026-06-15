"use client";

import { useEffect } from "react";

import {
  preloadShipmentEvidences,
} from "../services/evidence-cache-service";

import type {
  ShipmentEvidence,
} from "../types/shipment-evidence";

export function usePreloadShipmentEvidences(
  evidences: ShipmentEvidence[],
) {
  useEffect(() => {
    if (!evidences.length) {
      return;
    }

    preloadShipmentEvidences(
      evidences,
    );
  }, [evidences]);
}