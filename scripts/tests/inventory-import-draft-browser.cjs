/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const http = require("node:http");
const { build } = require("esbuild");
const { chromium } = require("playwright");

(async () => {
  const bundle = await build({
    stdin: {
      contents: `
        export { evidenceDb } from "./src/modules/shipments/services/evidence-cache-service";
        export { savePendingEvidenceFile } from "./src/modules/shipments/services/pending-evidence-storage";
        export { originalFor } from "./src/modules/shipments/services/editor-image-assets";
        export { readDraft, serializeDraft } from "./src/modules/inventory/services/import-draft";
      `,
      resolveDir: process.cwd(),
    },
    bundle: true,
    write: false,
    format: "iife",
    globalName: "draftApi",
    platform: "browser",
  });

  const server = http.createServer((request, response) => {
    if (request.url === "/bundle.js") {
      response.setHeader("Content-Type", "text/javascript");
      response.end(bundle.outputFiles[0].contents);
      return;
    }
    response.setHeader("Content-Type", "text/html");
    response.end('<!doctype html><script src="/bundle.js"></script>');
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      ...(process.env.BARCODE_CHROME
        ? { executablePath: process.env.BARCODE_CHROME }
        : {}),
    });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}`);

    await page.evaluate(async () => {
      await draftApi.evidenceDb.delete();
      await draftApi.evidenceDb.open();
      const file = new File(["persistent image bytes"], "sim.jpg", {
        type: "image/jpeg",
      });
      const item = {
        id: "image-1",
        file,
        originalFile: file,
        thumbnailUrl: "blob:temporary",
        storedLocally: true,
        scanCompleted: true,
        hd: false,
        notes: "lote de prueba",
        rotation: 90,
        flipX: false,
        flipY: true,
        cropX: 0.1,
        cropY: 0.2,
        cropWidth: 0.7,
        cropHeight: 0.6,
        shipmentItemId: null,
        detectedBarcode: "895000000000000000",
        barcodeOptions: ["895000000000000000"],
        detectedText: "",
        detectedCompanyCode: null,
        companyMismatchJustification: "",
      };
      await draftApi.savePendingEvidenceFile(item.id, "inventory-import:user-1", file);
      await draftApi.evidenceDb.importSessions.put({
        id: "inventory-import:user-1",
        metadata: draftApi.serializeDraft({
          courier: { id: "courier-1", name: "Mensajero" },
          company: { id: "company-1", name: "Empresa" },
          product: { id: "product-1", name: "SIM" },
          items: [item],
        }),
      });
    });

    await page.reload();
    const restored = await page.evaluate(async () => {
      const draft = await draftApi.readDraft("inventory-import:user-1");
      const item = draft.items[0];
      const original = await draftApi.originalFor(item);
      return {
        count: draft.items.length,
        courier: draft.courier.name,
        barcode: item.detectedBarcode,
        scanCompleted: item.scanCompleted,
        rotation: item.rotation,
        flipY: item.flipY,
        crop: [item.cropX, item.cropY, item.cropWidth, item.cropHeight],
        placeholderBytes: item.originalFile.size,
        originalBytes: original.size,
        originalName: original.name,
      };
    });

    assert.deepEqual(restored, {
      count: 1,
      courier: "Mensajero",
      barcode: "895000000000000000",
      scanCompleted: true,
      rotation: 90,
      flipY: true,
      crop: [0.1, 0.2, 0.7, 0.6],
      placeholderBytes: 0,
      originalBytes: 22,
      originalName: "sim.jpg",
    });
    console.log("PASS: IndexedDB draft survives reload with file, barcode and edits");
  } finally {
    await browser?.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
