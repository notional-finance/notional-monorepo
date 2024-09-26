import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface PendleIconProps extends SvgIconProps {}

export function PendleIcon(props: PendleIconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" fill="transparent" {...props}>
      <path
        d="M7.6815 24C10.5984 24 12.963 21.6354 12.963 18.7185C12.963 15.8016 10.5984 13.437 7.6815 13.437C4.76462 13.437 2.40002 15.8016 2.40002 18.7185C2.40002 21.6354 4.76462 24 7.6815 24Z"
        fill="#013D4A"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7.10059 14.6987V1.61112L8.27796 1.07023V14.6987H7.10059Z"
        fill="#013D4A"
      />
      <path
        d="M21.0007 9.60032C21.0007 14.5711 16.9711 18.6006 12.0003 18.6006C7.0296 18.6006 3.00002 14.5711 3.00002 9.60032C3.00002 4.62958 7.0296 0.6 12.0003 0.6C16.9711 0.6 21.0007 4.62958 21.0007 9.60032Z"
        stroke="#013D4A"
        stroke-width="1.2"
      />
    </SvgIcon>
  );
}
