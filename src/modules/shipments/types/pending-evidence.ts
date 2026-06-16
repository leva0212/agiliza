import { generateId }
    from "@/shared/utils/generate-id";

export type PendingEvidence = {
    id: string;

    file: File;

    previewUrl: string;

    originalPreviewUrl: string;

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

export function createPendingEvidence(
    file: File,
): PendingEvidence {


    const previewUrl =
        URL.createObjectURL(file);

    return {
        id: generateId(),

        file,

        originalPreviewUrl:
            previewUrl,

        previewUrl,

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