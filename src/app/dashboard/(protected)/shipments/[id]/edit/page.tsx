"use client";

import { useParams } from "next/navigation";

import {
  ShipmentForm,
} from "@/modules/shipments/components/shipment-form";

export default function EditShipmentPage() {

  const params =
    useParams();

  return (

    <ShipmentForm
      shipmentId={
        params.id as string
      }
    />

  );

}