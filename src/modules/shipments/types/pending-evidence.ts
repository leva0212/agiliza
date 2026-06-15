import { generateId }
    from "@/shared/utils/generate-id";

export type PendingEvidence = {
    id: string;

    file: File;

    previewUrl: string;

    hd: boolean;

    notes: string;

    rotation: number;

    flipX: boolean;

    flipY: boolean;
};

export function createPendingEvidence(
    file: File,
): PendingEvidence {
    return {
        id: generateId(),

        file,

        previewUrl:
            URL.createObjectURL(file),

        hd: false,

        notes: "",

        rotation: 0,

        flipX: false,

        flipY: false,
    };
}