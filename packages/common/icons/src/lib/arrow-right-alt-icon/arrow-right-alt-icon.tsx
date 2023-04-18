import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface ArrowRightAltIconProps extends SvgIconProps {}

export function ArrowRightAltIcon(props: ArrowRightAltIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 14 14">
      <path
        d="M8 6.5L1.64706 12.5L0 10.9444L4.70588 6.5L0 2.05556L1.64706 0.500001L8 6.5Z"
        fill="white"
      />
    </SvgIcon>
  );
}

export default ArrowRightAltIcon;
