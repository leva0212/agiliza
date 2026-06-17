import { processImage }
    from "@/shared/utils/process-image";
    
    import { generateId }
    from "@/shared/utils/generate-id";

export type PendingEvidence = {
    id: string;

    file: File;

    originalFile: File;

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
        originalFile: file,

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

export async function createCompressedPendingEvidence(
    file: File,
): Promise<PendingEvidence> {

    const compressedFile =
        await processImage(
            file,
            {
                hd: false,

                rotation: 0,

                flipX: false,

                flipY: false,

                cropX: 0,

                cropY: 0,

                cropWidth: 1,

                cropHeight: 1,
            },
        );

    const previewUrl =
        URL.createObjectURL(
            compressedFile,
        );

    console.log(
        "[Initial Compression]",
        {
            originalMB:
                (
                    file.size /
                    1024 /
                    1024
                ).toFixed(2),

            compressedMB:
                (
                    compressedFile.size /
                    1024 /
                    1024
                ).toFixed(2),
        },
    );

    return {
        id: generateId(),

        file:
            compressedFile,

        originalFile:
            file,

        previewUrl,

        originalPreviewUrl:
            URL.createObjectURL(file),

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