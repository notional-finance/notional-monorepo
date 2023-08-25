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
  displayFormatter?: any; 
  marginRight?: any; 
};
