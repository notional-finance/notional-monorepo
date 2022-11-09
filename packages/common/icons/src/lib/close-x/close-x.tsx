import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface CloseXProps extends SvgIconProps {}

export function CloseX(props: CloseXProps) {
  return (
    <SvgIcon {...props}>
      <path d="M19 1L1 19" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 1L19 19" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  );
}

export default CloseX;
