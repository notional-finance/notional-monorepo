/* eslint-disable */
// material-ui
import Color from '@mui/material/Color';

declare module '@mui/material' {
  interface Color {
    0?: string;
    A50?: string;
    A800?: string;
  }
}

// react-table
declare module '@tanstack/react-table' {
  export interface ColumnMeta {
    className?: string;
  }

  export interface TableMeta {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
    revertData?: (rowIndex: number, revert: unknown) => void;
    selectedRow?: any;
    setSelectedRow?: any;
  }
}
