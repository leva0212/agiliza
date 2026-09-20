import { MRT_Localization_ES } from "material-react-table/locales/es";

export const standardMrtHeadCellSx = {
  verticalAlign: "top",
  "& .Mui-TableHeadCell-Content": {
    alignItems: "stretch",
    flexDirection: "column",
    gap: "0.125rem",
  },
  "& .Mui-TableHeadCell-Content-Labels": {
    alignItems: "flex-start",
    flexWrap: "wrap",
    overflow: "visible",
    width: "100%",
  },
  "& .Mui-TableHeadCell-Content-Wrapper": {
    flex: "1 1 100%",
    lineHeight: 1.2,
    minWidth: 0,
    overflow: "visible",
    overflowWrap: "anywhere",
    textOverflow: "clip",
    whiteSpace: "normal",
  },
  "& .Mui-TableHeadCell-Content-Actions": {
    alignSelf: "flex-end",
  },
} as const;

export const standardMrtFeatures = {
  localization: MRT_Localization_ES,
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
  defaultColumn: {
    minSize: 110,
  },
  muiTableHeadCellProps: {
    sx: standardMrtHeadCellSx,
  },
  muiTablePaperProps: {
    sx: {
      borderRadius: { xs: 0, sm: "inherit" },
      marginLeft: { xs: "calc(50% - 50vw)", sm: 0 },
      maxWidth: { xs: "100vw", sm: "100%" },
      overflow: "hidden",
      width: { xs: "100vw", sm: "100%" },
    },
  },
  muiTableContainerProps: {
    sx: {
      maxWidth: "100%",
      overflowX: "auto",
      width: "100%",
    },
  },
} as const;
