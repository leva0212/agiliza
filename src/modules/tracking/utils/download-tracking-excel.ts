import { Workbook } from "exceljs";
import type { TrackingRecord } from "../types/tracking-record";

type TrackingExcelFilters = {
  startDate: string;
  endDate: string;
  company: string;
  status: string;
  province: string;
  search: string;
};

type DownloadTrackingExcelOptions = {
  records: TrackingRecord[];
  filters: TrackingExcelFilters;
  includeCompany: boolean;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function downloadFile(buffer: ArrayBuffer, fileName: string) {
  const blob = new Blob([
    buffer,
  ], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

export async function downloadTrackingExcel({
  records,
  filters,
  includeCompany,
}: DownloadTrackingExcelOptions) {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Tracking", {
    views: [{ state: "frozen", ySplit: 5 }],
  });
  const headers = [
    "Fecha y hora",
    "Nombre",
    "Cédula",
    "Provincia",
    "Estatus",
    "Comentario",
    ...(includeCompany ? ["Empresa"] : []),
  ];
  const lastColumn = headers.length;

  worksheet.mergeCells(1, 1, 1, lastColumn);
  worksheet.getCell("A1").value = "Tracking de envíos";
  worksheet.getCell("A1").font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  worksheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E3A8A" },
  };
  worksheet.getCell("A1").alignment = { horizontal: "center" };

  worksheet.mergeCells(2, 1, 2, lastColumn);
  worksheet.getCell("A2").value = `Período: ${filters.startDate} a ${filters.endDate}`;
  worksheet.getCell("A2").font = { bold: true, color: { argb: "FF1E3A8A" } };

  worksheet.mergeCells(3, 1, 3, lastColumn);
  worksheet.getCell("A3").value = `Empresa: ${filters.company}  |  Estatus: ${filters.status}  |  Provincia: ${filters.province}  |  Búsqueda: ${filters.search || "Sin búsqueda"}`;
  worksheet.getCell("A3").alignment = { wrapText: true };
  worksheet.getCell("A3").font = { italic: true, color: { argb: "FF475569" } };

  const headerRow = worksheet.getRow(5);
  headerRow.values = headers;
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  for (const record of records) {
    const row = worksheet.addRow([
      formatDate(record.created_at),
      record.full_name,
      record.identification,
      record.province?.name ?? "",
      record.status,
      record.comment ?? "",
      ...(includeCompany
        ? [record.company?.trade_name?.trim() || record.company?.name || ""]
        : []),
    ]);

    row.alignment = { vertical: "top", wrapText: true };
    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: "hair", color: { argb: "FFE2E8F0" } },
      };
    });
  }

  worksheet.columns = [
    { width: 20 },
    { width: 30 },
    { width: 18 },
    { width: 20 },
    { width: 22 },
    { width: 48 },
    ...(includeCompany ? [{ width: 26 }] : []),
  ];
  worksheet.autoFilter = {
    from: { row: 5, column: 1 },
    to: { row: 5, column: lastColumn },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  downloadFile(buffer, `tracking-${filters.startDate}-a-${filters.endDate}.xlsx`);
}
