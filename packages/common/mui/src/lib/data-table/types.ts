import { MessageDescriptor } from 'react-intl';
import { Dispatch, ReactNode, SetStateAction } from 'react';

export enum TABLE_VARIANTS {
  MINI = 'mini',
  DEFAULT = 'default',
  TOTAL_ROW = 'total-row',
  SORTABLE = 'sortable',
}

export type TabBarPropsType = {
  tableTabs: { title: ReactNode; toolTipText?: MessageDescriptor }[];
  setCurrentTab: Dispatch<SetStateAction<number>>;
  currentTab: number;
};

export type ToggleBarPropsType = {
  toggleData: React.ReactNode[];
  setToggleOption: Dispatch<SetStateAction<number>>;
  toggleOption: number;
  showToggle: boolean;
};

export type TableTitleButtonsType = {
  buttonText: string | ReactNode;
  callback: () => void;
};

export type ExpandedRows = {
  [key: string]: boolean;
};

export type DataTableColumn = {
  expandableTable?: boolean;
  textAlign?: string;
  showLinkIcon?: boolean;
  defaultCanSort?: boolean;
  sortType?: string;
  sortDescFirst?: boolean;
  displayFormatter?: any;
  showSymbol?: boolean;
  columnHeaderToolTip?: MessageDescriptor; 
  marginRight?: any;
  className?: string;
  sticky?: string;
  showLoadingSpinner?: boolean;
  showGreenText?: boolean;
  ToolTip?: ReactNode;
  tooRisky?: boolean;
  header: string | ReactNode;
  accessorKey: string;
  cell?: (row: any) => any;
  width?: string;
  sortingFn?: any;
  enableSorting?: boolean;
  fontSize?: string;
  showCustomIcon?: boolean;
};
