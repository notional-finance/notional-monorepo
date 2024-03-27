import { ReactNode } from 'react';
import { MessageDescriptor } from 'react-intl';

export enum CONTEST_TABLE_VARIANTS {
  COMPACT = 'compact',
  DEFAULT = 'default',
}



export type ContestTableColumn =  {
  textAlign?: string;
  showLinkIcon?: boolean;
  defaultCanSort?: boolean;
  sortType?: string;
  sortDescFirst?: boolean;
  displayFormatter?: any; 
  showSymbol?: boolean; 
  columnHeaderToolTip?: MessageDescriptor; 
  marginRight?: any; 
  isIDCell?: boolean;
  padding?: string;
  display?: string;
  header: string | ReactNode;
  accessorKey: string;
  cell?: (row: any) => any;
  width?: string;
  isIDcell?: boolean;
};
