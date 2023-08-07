import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface JpyIconProps extends SvgIconProps {}

export function JpyIcon(props: JpyIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 14 14">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 46 46">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M23 46C35.7025 46 46 35.7025 46 23C46 10.2975 35.7025 0 23 0C10.2975 0 0 10.2975 0 23C0 35.7025 10.2975 46 23 46ZM32.4286 22.4444H26.0171L34 10H30.2757L23 21.34L15.7243 10H12L19.9829 22.4444H13.5714V25.5556H21.4286V28.6667H13.5714V31.7778H21.4286V38H24.5714V31.7778H32.4286V28.6667H24.5714V25.5556H32.4286V22.4444Z"
        />
      </svg>
    </SvgIcon>
  );
}

export default JpyIcon;
