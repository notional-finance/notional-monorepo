import { ComponentClass, FunctionComponent } from 'react';

// material-ui
import { SvgIconTypeMap } from '@mui/material/SvgIcon';
import { OverridableComponent } from '@mui/material/OverridableComponent';

// types
import { MenuProps } from './menu';
import { SnackbarProps } from './snackbar';
import { KanbanStateProps } from './kanban';
import { InvoiceProps } from './invoice';

// ==============================|| ROOT TYPES ||============================== //

export type RootStateProps = {
  menu: MenuProps;
  snackbar: SnackbarProps;
  kanban: KanbanStateProps;
  invoice: InvoiceProps;
};

export type KeyedObject = {
  [key: string]: string | number | KeyedObject | any;
};

export type OverrideIcon =
  | (OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {
      muiName: string;
    })
  | ComponentClass<any>
  | FunctionComponent<any>;

export interface GenericCardProps {
  title?: string;
  primary?: string | number | undefined;
  secondary?: string;
  content?: string;
  image?: string;
  dateTime?: string;
  iconPrimary?: OverrideIcon;
  color?: string;
  size?: string;
}
