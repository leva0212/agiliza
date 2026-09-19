export const standardMrtFeatures = {
  enableColumnActions: true,
  enableColumnFilters: true,
  enableColumnOrdering: true,
  enableColumnPinning: true,
  enableColumnResizing: true,
  enableDensityToggle: true,
  enableFullScreenToggle: true,
  enableGlobalFilter: true,
  enableHiding: true,
  enableSorting: true,
  columnResizeMode: "onChange" as const,
  muiTablePaperProps: {
    sx: {
      width: "100%",
      maxWidth: "100%",
      overflow: "hidden",
    },
  },
  muiTableContainerProps: {
    sx: {
      width: "100%",
      maxWidth: "100%",
      overflowX: "auto",
    },
  },
} as const;
