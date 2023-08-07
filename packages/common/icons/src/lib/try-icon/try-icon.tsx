import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface TryIconProps extends SvgIconProps {}

export function TryIcon(props: TryIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 14 14">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 46 46">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M23 46C35.7025 46 46 35.7025 46 23C46 10.2975 35.7025 0 23 0C10.2975 0 0 10.2975 0 23C0 35.7025 10.2975 46 23 46ZM18.25 8V17.6L13 20.7333V24.6667L18.25 21.5333V25.5L13 28.6V32.5333L18.25 29.4V38H21.75C28.5225 38 34 32.7833 34 26.3333H30.5C30.5 30.9333 26.58 34.6667 21.75 34.6667V27.3167L28.75 23.1333V19.2L21.75 23.3667V19.45L28.75 15.2667V11.3333L21.75 15.5V8H18.25Z"
        />
      </svg>
    </SvgIcon>
  );
}

export default TryIcon;
