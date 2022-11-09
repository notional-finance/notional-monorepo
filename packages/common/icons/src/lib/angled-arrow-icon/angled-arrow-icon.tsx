import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface AngledArrowIconProps extends SvgIconProps {}

export function AngledArrowIcon(props: AngledArrowIconProps) {
  return (
    <SvgIcon viewBox={'0 0 12 12'} {...props}>
      <path d="M11.25 1.8075L10.1925 0.750001L1.5 9.4425L1.5 4.5L-3.27835e-07 4.5L-9.83506e-07 12L7.5 12L7.5 10.5L2.5575 10.5L11.25 1.8075Z" />
    </SvgIcon>
  );
}

export default AngledArrowIcon;
