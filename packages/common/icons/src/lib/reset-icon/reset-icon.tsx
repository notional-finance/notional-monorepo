import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface ResetIconProps extends SvgIconProps {}

export function ResetIcon(props: ResetIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M10.315 5C13.08 5 15.32 7.25 15.32 10C15.32 12.75 13.08 15 10.315 15C8.56 15 7.025 14.09 6.13 12.715L6.92 12.09C7.625 13.235 8.88 14 10.32 14C11.3809 14 12.3983 13.5786 13.1484 12.8284C13.8986 12.0783 14.32 11.0609 14.32 10C14.32 8.93913 13.8986 7.92172 13.1484 7.17157C12.3983 6.42143 11.3809 6 10.32 6C8.28 6 6.6 7.53 6.355 9.5H7.735L5.865 11.365L4 9.5H5.345C5.595 6.975 7.725 5 10.315 5Z" />
    </SvgIcon>
  );
}

export default ResetIcon;
