import { generateId } from "@/shared/utils/generate-id";

export type PendingEvidence = {
  id: string;
  file: File;
  originalFile: File;
  thumbnailUrl: string;
  hd: boolean;
  notes: string;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  shipmentItemId: string | null;
  detectedBarcode: string | null;
  barcodeOptions: string[];
  detectedText: string;
  detectedCompanyCode: string | null;
  companyMismatchJustification: string;
};

/**
 * Creates only lightweight metadata. The image is not decoded or processed
 * until it becomes the active item in the editor.
 */
export function createPendingEvidence(file: File): PendingEvidence {
  return {
    id: generateId(),
    file,
    originalFile: file,
    thumbnailUrl: "",
    hd: false,
    notes: "",
    rotation: 0,
    flipX: false,
    flipY: false,
    cropX: 0,
    cropY: 0,
    cropWidth: 0,
    cropHeight: 0,
    shipmentItemId: null,
    detectedBarcode: null,
    barcodeOptions: [],
    detectedText: "",
    detectedCompanyCode: null,
    companyMismatchJustification: "",
  };
}
