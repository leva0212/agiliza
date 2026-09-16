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
  };
}