import type { ShipmentEvidence }
    from "../types/shipment-evidence";

import {
    getCachedEvidence,
} from "./evidence-cache-service";

type Input = {
    trackingNumber: string;

    evidences: ShipmentEvidence[];

    includeComments?: boolean;
};

export async function shareEvidences({
    trackingNumber,
    evidences,
    includeComments = true,
}: Input) {
    if (
        typeof navigator.share !==
        "function"
    ) {
        throw new Error(
            [
                "La función Compartir no está disponible.",
                "",
                "Pruebe alguna de estas opciones:",
                "• Abrir desde HTTPS",
                "• Instalar la PWA",
                "• Usar Chrome Android",
                "• O utilizar 'Guardar archivos'",
            ].join("\n"),
        );
    }

    const files: File[] = [];

    const comments: string[] = [];

    let index = 1;

    for (const evidence of evidences) {
        const cached =
            await getCachedEvidence(
                evidence.id,
            );

        if (!cached) {
            continue;
        }

        const extension =
            getExtension(
                evidence.mime_type,
            );

        const fileName =
            `${trackingNumber}-Evidencia-${String(index).padStart(2, "0")}.${extension}`;

        files.push(
            new File(
                [cached.blob],
                fileName,
                {
                    type:
                        evidence.mime_type ??
                        "image/jpeg",
                },
            ),
        );

        if (
            evidence.notes?.trim()
        ) {
            comments.push(
                `📷 Evidencia ${index}\n${evidence.notes.trim()}`,
            );
        }

        index++;
    }

    await navigator.share({
        title:
            `Evidencias ${trackingNumber}`,

        text:
            includeComments &&
                comments.length > 0
                ? [
                    `EVIDENCIAS ${trackingNumber}`,
                    "",
                    ...comments,
                ].join("\n\n")
                : undefined,

        files,
    });
}

function getExtension(
    mimeType: string | null,
) {
    switch (mimeType) {
        case "image/jpeg":
            return "jpg";

        case "image/png":
            return "png";

        case "image/webp":
            return "webp";

        default:
            return "jpg";
    }
}