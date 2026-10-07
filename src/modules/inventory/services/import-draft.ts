import { evidenceDb } from "@/modules/shipments/services/evidence-cache-service";
import type { PendingEvidence } from "@/modules/shipments/types/pending-evidence";

type Selection = { id: string; name: string };
export type ImportDraft = {
  courier: Selection | null;
  company: Selection | null;
  product: Selection | null;
  items: PendingEvidence[];
};

export function serializeDraft(draft: ImportDraft) {
  return JSON.stringify({
    ...draft,
    items: draft.items.map((item) => ({
      ...item,
      file: undefined,
      originalFile: undefined,
      thumbnailUrl: undefined,
      originalName: item.originalFile.name,
      mimeType: item.originalFile.type,
    })),
  });
}

export async function readDraft(id: string): Promise<ImportDraft | null> {
  const record = await evidenceDb.importSessions.get(id);
  if (!record) return null;
  const draft = JSON.parse(record.metadata);
  draft.items = draft.items.map((item: PendingEvidence & { originalName: string; mimeType: string }) => {
    // Empty files preserve the existing editor contract; bytes are loaded on demand.
    const file = new File([], item.originalName, { type: item.mimeType });
    return { ...item, file, originalFile: file, thumbnailUrl: "", storedLocally: true };
  });
  return draft;
}

export async function clearDraft(id: string, items: PendingEvidence[]) {
  await evidenceDb.transaction("rw", evidenceDb.importSessions, evidenceDb.pendingEvidences, evidenceDb.imageAssets, async () => {
    await evidenceDb.importSessions.delete(id);
    for (const item of items) {
      await evidenceDb.pendingEvidences.delete(item.id);
      await evidenceDb.imageAssets.where("ownerId").equals(item.id).delete();
    }
  });
}
