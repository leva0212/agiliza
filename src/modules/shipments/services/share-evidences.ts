import type { ShipmentEvidence }
    from "../types/shipment-evidence";

import {
    getCachedEvidence,
} from "./evidence-cache-service";

type Input = {
    trackingNumber: string;

    evidences: ShipmentEvidence[];
};

export async function shareEvidences({
    trackingNumber,
    evidences,
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

        comments.push(
            [
                "--------------------------------",
                `EVIDENCIA ${index}`,
                "",
                evidence.notes ??
                "Sin comentarios",
                "",
            ].join("\n"),
        );

        index++;
    }

    const commentsFile =
        new File(
            [comments.join("\n")],
            `${trackingNumber}-Comentarios.txt`,
            {
                type: "text/plain",
            },
        );

    /* files.push(
         commentsFile,
     );*/

    console.log(
        "FILES",
        files.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
        })),
    );
    console.log(
        "TOTAL FILES",
        files.length,
    );

    await navigator.share({
        title:
            `Evidencias ${trackingNumber}`,

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