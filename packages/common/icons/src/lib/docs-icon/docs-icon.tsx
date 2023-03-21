import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface DocsIconProps extends SvgIconProps {}

export function DocsIcon(props: DocsIconProps) {
  return (
    <SvgIcon {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M19.3125 5.25H13.125L12.7312 5.41875L12 6.13875L11.2687 5.41875L10.875 5.25H4.6875L4.125 5.8125V17.0625L4.6875 17.625H10.6388L11.6063 18.5813H12.3938L13.3612 17.625H19.3125L19.875 17.0625V5.8125L19.3125 5.25ZM11.4375 16.86L11.235 16.6687L10.875 16.5H5.25V6.375H10.6388L11.4713 7.2075L11.4375 16.86ZM18.75 16.5H13.125L12.7312 16.6687L12.5738 16.815V7.1625L13.3612 6.375H18.75V16.5ZM9.75 8.625H6.375V9.75H9.75V8.625ZM9.75 13.125H6.375V14.25H9.75V13.125ZM6.375 10.875H9.75V12H6.375V10.875ZM17.625 8.625H14.25V9.75H17.625V8.625ZM14.25 10.875H17.625V12H14.25V10.875ZM14.25 13.125H17.625V14.25H14.25V13.125Z"
        />
      </svg>
    </SvgIcon>
  );
}

export default DocsIcon;
