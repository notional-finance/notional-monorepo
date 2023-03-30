import { MessageDescriptor } from 'react-intl';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import { Column } from 'react-table';

export enum TABLE_VARIANTS {
  MINI = 'mini',
  DEFAULT = 'default',
  TOTAL_ROW = 'total-row',
}

export type TabBarPropsType = {
  tableTabs: { title: ReactNode; toolTipText?: MessageDescriptor }[];
  setCurrentTab: Dispatch<SetStateAction<number>>;
  currentTab: number;
};

export type TableTitleButtonsType = {
  buttonText: string;
  callback: () => void;
};

export type ExpandedRows = {
  [key: string]: boolean;
};

export type DataTableColumn = Column & {
  expandableTable?: boolean;
  textAlign?: string;
  showLinkIcon?: boolean;
};
