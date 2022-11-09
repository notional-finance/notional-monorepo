import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface BarChartIconProps extends SvgIconProps {}

export function BarChartIcon(props: BarChartIconProps) {
  return (
    <SvgIcon viewBox="0 0 18 18" {...props}>
      <path d="M2.84211 12.7895L0 15.5747V7.57895H2.84211V12.7895ZM7.57895 11.0463L6.09158 9.77684L4.73684 11.0274V3.78947H7.57895V11.0463ZM12.3158 9.47368L9.47368 12.3158V0H12.3158V9.47368ZM14.9779 9.29368L13.2632 7.57895H18V12.3158L16.3042 10.62L9.47368 17.3937L6.18632 14.5326L2.60526 18H0L6.12947 11.9937L9.47368 14.8168" />
    </SvgIcon>
  );
}

export default BarChartIcon;
