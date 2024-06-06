import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface PointsIcon extends SvgIconProps {
  fill?: string;
}

export function PointsIcon(props: PointsIcon) {
  return (
    <SvgIcon viewBox="0 0 20 20" {...props}>
      <path
        id="Vector"
        d="M10 3.18182L11.1111 8.88889L16.8182 10L11.1111 11.1111L10 16.8182L8.88889 11.1111L3.18182 10L8.88889 8.88889L10 3.18182ZM10 0L7.27273 7.27273L0 10L7.27273 12.7273L10 20L12.7273 12.7273L20 10L12.7273 7.27273L10 0Z"
        fill={props?.fill || 'url(#paint0_linear_7349_41030)'}
      />
      <defs>
        <linearGradient
          id="paint0_linear_7349_41030"
          x1="10"
          y1="0"
          x2="10"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#2BCAD0" />
          <stop offset="1" stop-color="#8BA4E5" />
        </linearGradient>
      </defs>
    </SvgIcon>
  );
}

export default PointsIcon;
