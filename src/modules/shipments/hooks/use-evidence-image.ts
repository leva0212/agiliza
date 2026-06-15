"use client";

import { useEffect, useState } from "react";

import {
    getEvidenceImageUrl,
} from "../services/evidence-cache-service";

export function useEvidenceImage(
    evidenceId: string,
    shipmentId: string,
    fileUrl: string | null,
) {
    const [imageUrl, setImageUrl] =
        useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        let objectUrl: string | null =
            null;

        async function load() {
            if (!fileUrl) {
                return;
            }

            const url =
                await getEvidenceImageUrl(
                    evidenceId,
                    shipmentId,
                    fileUrl,
                );

            if (!mounted) {
                return;
            }

            objectUrl = url;

            setImageUrl(url);
        }

        load();

        return () => {
            mounted = false;

            if (
                objectUrl &&
                objectUrl.startsWith("blob:")
            ) {
                URL.revokeObjectURL(
                    objectUrl,
                );
            }
        };
    }, [
        evidenceId,
        shipmentId,
        fileUrl,
    ]);

    return imageUrl;
}