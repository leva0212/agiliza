import {
  getTrackingRecords,
  type TrackingRecordFilters,
} from "./get-tracking-records";
import type { TrackingRecord } from "../types/tracking-record";

type TrackingExportFilters = Omit<
  TrackingRecordFilters,
  "pageIndex" | "pageSize"
>;

const exportPageSize = 1000;

export async function exportTrackingRecords(
  filters: TrackingExportFilters,
): Promise<TrackingRecord[]> {
  const records: TrackingRecord[] = [];
  let pageIndex = 0;

  while (true) {
    const result = await getTrackingRecords({
      ...filters,
      pageIndex,
      pageSize: exportPageSize,
    });

    records.push(...result.data);

    if (result.data.length < exportPageSize) {
      return records;
    }

    pageIndex += 1;
  }
}
