import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface YoutubeIconProps extends SvgIconProps {}

export function YoutubeIcon(props: YoutubeIconProps) {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 23 14">
        <path
          d="M9.2 10L15.1685 7L9.2 4V10ZM22.494 2.17C22.6435 2.64 22.747 3.27 22.816 4.07C22.8965 4.87 22.931 5.56 22.931 6.16L23 7C23 9.19 22.816 10.8 22.494 11.83C22.2065 12.73 21.5395 13.31 20.5045 13.56C19.964 13.69 18.975 13.78 17.457 13.84C15.962 13.91 14.5935 13.94 13.3285 13.94L11.5 14C6.6815 14 3.68 13.84 2.4955 13.56C1.4605 13.31 0.7935 12.73 0.506 11.83C0.3565 11.36 0.253 10.73 0.184 9.93C0.1035 9.13 0.0689999 8.44 0.0689999 7.84L0 7C0 4.81 0.184 3.2 0.506 2.17C0.7935 1.27 1.4605 0.69 2.4955 0.44C3.036 0.31 4.025 0.22 5.543 0.16C7.038 0.0899998 8.4065 0.0599999 9.6715 0.0599999L11.5 0C16.3185 0 19.32 0.16 20.5045 0.44C21.5395 0.69 22.2065 1.27 22.494 2.17Z"
          fill="#6E7C90"
        />
      </svg>
    </SvgIcon>
  );
}

export default YoutubeIcon;
