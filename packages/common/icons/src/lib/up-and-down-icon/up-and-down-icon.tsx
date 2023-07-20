import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface UpAndDownIconProps extends SvgIconProps {}

export function UpAndDownIcon(props: UpAndDownIconProps) {
  return (
    <SvgIcon {...props} viewBox="0.49 0 6.29 11">
      <path d="M3.62943 0L6.77262 3.81091H0.486252L3.62943 0Z" fill="#6E7C90" />
      <path
        d="M3.62943 11L6.77262 7.18909H0.486252L3.62943 11Z"
        fill="#6E7C90"
      />
    </SvgIcon>
  );
}

export default UpAndDownIcon;
