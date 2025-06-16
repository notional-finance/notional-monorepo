import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface PointsOutlineIconProps extends SvgIconProps {
  fill?: string;
  stroke?: string;
}

export function PointsOutlineIcon(props: PointsOutlineIconProps) {
  return (
    <SvgIcon viewBox="0 0 16 16" {...props}>
      <path d="M8 2.54545L8.88889 7.11111L13.4545 8L8.88889 8.88889L8 13.4545L7.11111 8.88889L2.54545 8L7.11111 7.11111L8 2.54545ZM8 0L5.81818 5.81818L0 8L5.81818 10.1818L8 16L10.1818 10.1818L16 8L10.1818 5.81818L8 0Z" />
    </SvgIcon>
  );
}
