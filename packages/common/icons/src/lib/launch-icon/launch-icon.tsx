import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface LaunchIconProps extends SvgIconProps {}

export function LaunchIcon(props: LaunchIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M9.74998 2.25L12.2197 4.71975L6.96973 9.96975L8.03023 11.0302L13.2802 5.78025L15.75 8.25V2.25H9.74998Z" />
      <path d="M14.25 14.25H3.75V3.75H9L7.5 2.25H3.75C2.92275 2.25 2.25 2.92275 2.25 3.75V14.25C2.25 15.0773 2.92275 15.75 3.75 15.75H14.25C15.0773 15.75 15.75 15.0773 15.75 14.25V10.5L14.25 9V14.25Z" />
    </SvgIcon>
  );
}

export default LaunchIcon;
