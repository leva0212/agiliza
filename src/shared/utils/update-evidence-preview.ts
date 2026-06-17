import { processImage }
    from "@/shared/utils/process-image";

import type { PendingEvidence }
    from "@/modules/shipments/types/pending-evidence";

export async function updateEvidencePreview(
    evidence: PendingEvidence,
): Promise<PendingEvidence> {

    const processedFile =
        await processImage(
            evidence.file,
            {
                hd: evidence.hd,

                rotation:
                    evidence.rotation,

                flipX:
                    evidence.flipX,

                flipY:
                    evidence.flipY,

                cropX:
                    evidence.cropX,

                cropY:
                    evidence.cropY,

                cropWidth:
                    evidence.cropWidth || 1,

                cropHeight:
                    evidence.cropHeight || 1,
            },
        );

    console.log(
        "[Evidence Preview]",
        {
            originalMB:
                (
                    evidence.originalFile.size /
                    1024 /
                    1024
                ).toFixed(2),

            generatedMB:
                (
                    processedFile.size /
                    1024 /
                    1024
                ).toFixed(2),

            hd:
                evidence.hd,
        },
    );

    /* URL.revokeObjectURL(
         evidence.previewUrl,
     );*/

    const previewUrl =
        URL.createObjectURL(
            processedFile,
        );

    return {
    ...evidence,

    file: processedFile,

    previewUrl,

    rotation: 0,

    flipX: false,

    flipY: false,

    cropX: 0,

    cropY: 0,

    cropWidth: 0,

    cropHeight: 0,
};
}