import React from 'react';

export interface INavLink {
  key: string;
  label?: React.ReactElement;
  link?: string;
  iconImg?: React.ReactElement;
  external?: boolean;
  target?: '_blank' | '_parent' | '_self' | '_top';
  noBottomBorder?: boolean;
  CustomComponent?: any;
}
