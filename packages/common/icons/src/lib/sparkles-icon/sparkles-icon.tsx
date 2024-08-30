import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface SparklesIconProps extends SvgIconProps {}

export function SparklesIcon(props: SparklesIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 14 14">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_9738_104433)">
          <path
            d="M6.5 16L4.86312 11.6369L0.5 10L4.86312 8.36312L6.5 4L8.13688 8.36312L12.5 10L8.13688 11.6369L6.5 16ZM2.75 5.5L2.01344 3.48656L0 2.75L2.01344 2.01344L2.75 0L3.48656 2.01344L5.5 2.75L3.48656 3.48656L2.75 5.5ZM12.5 8L11.5278 5.47219L9 4.5L11.5278 3.52781L12.5 1L13.4722 3.52781L16 4.5L13.4722 5.47219L12.5 8Z"
            fill="url(#paint0_linear_9738_104433)"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_9738_104433"
            x1="8"
            y1="0"
            x2="8"
            y2="16"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#2BCAD0" />
            <stop offset="1" stopColor="#8BC1E5" />
          </linearGradient>
          <clipPath id="clip0_9738_104433">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </SvgIcon>
  );
}

export default SparklesIcon;
