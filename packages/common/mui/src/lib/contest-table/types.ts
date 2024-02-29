import { MessageDescriptor } from 'react-intl';
import { Column } from 'react-table';

export enum CONTEST_TABLE_VARIANTS {
  COMPACT = 'compact',
  DEFAULT = 'default',
}



export type ContestTableColumn = Column & {
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
};
