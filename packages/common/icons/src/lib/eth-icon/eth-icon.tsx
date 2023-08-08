import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface EthIconProps extends SvgIconProps {}

export function EthIcon(props: EthIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 14 14">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 46 46">
        <g clipPath="url(#clip0_11939_97153)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M23 46C10.2968 46 0 35.7032 0 23C0 10.2968 10.2968 0 23 0C35.7032 0 46 10.2968 46 23C46 35.7032 35.7032 46 23 46ZM34.4914 23.3148L23.7159 5.75L12.9375 23.3162L23.7159 29.5737L34.4914 23.3148ZM34.5 25.323L23.7159 31.5776L12.9375 25.3244L23.7159 40.2428L34.5 25.323Z"
          />
          <path
            d="M23.7158 5.75V18.5006L34.4928 23.3162L23.7158 5.75ZM23.7158 31.579V40.2428L34.4999 25.323L23.7158 31.579Z"
            fill="#1C4E5C"
            fillOpacity="0.298"
          />
          <path
            d="M23.7158 29.5741L34.4928 23.3167L23.7158 18.5039V29.5741Z"
            fill="#1C4E5C"
            fillOpacity="0.801"
          />
          <path
            d="M12.9375 23.3167L23.7159 29.5741V18.5039L12.9375 23.3167Z"
            fill="#1C4E5C"
            fillOpacity="0.298"
          />
        </g>
        <defs>
          <clipPath id="clip0_11939_97153">
            <rect width="46" height="46" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </SvgIcon>
  );
}

export default EthIcon;
