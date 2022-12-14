import { SvgIcon, SvgIconProps } from '@mui/material';
import React from 'react';

/* eslint-disable-next-line */
export interface CircleIconProps extends SvgIconProps {}

export const CircleIcon = (props: CircleIconProps) => {
  return (
    <SvgIcon {...props}>
      <path
        d="M23.5 12C23.5 18.3513 18.3513 23.5 12 23.5C5.64873 23.5 0.5 18.3513 0.5 12C0.5 5.64873 5.64873 0.5 12 0.5C18.3513 0.5 23.5 5.64873 23.5 12Z"
        fill="transparent"
      />
    </SvgIcon>
  );
};
