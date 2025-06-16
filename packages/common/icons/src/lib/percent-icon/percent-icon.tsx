/* eslint-disable-next-line */
import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface PercentIconProps extends SvgIconProps {}

export function PercentIcon(props: PercentIconProps) {
  return (
    <SvgIcon viewBox="0 0 25 24" {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_15213_102026)">
          <path
            d="M5.1 0.9H18.9C21.2196 0.9 23.1 2.7804 23.1 5.1V18.9C23.1 21.2196 21.2196 23.1 18.9 23.1H5.1C2.7804 23.1 0.9 21.2196 0.9 18.9V5.1C0.9 2.7804 2.7804 0.9 5.1 0.9Z"
            strokeWidth="1.8"
            fill="transparent"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.8921 7.10847C17.2268 7.44321 17.2268 7.98592 16.8921 8.32066L8.32066 16.8921C7.98592 17.2268 7.44321 17.2268 7.10847 16.8921C6.77374 16.5573 6.77374 16.0146 7.10847 15.6799L15.6799 7.10847C16.0146 6.77374 16.5573 6.77374 16.8921 7.10847Z"
            fill="transparent"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.62124 6.78824C7.94273 6.46675 8.37877 6.28613 8.83343 6.28613C9.28808 6.28613 9.72412 6.46675 10.0456 6.78824C10.3671 7.10973 10.5477 7.54576 10.5477 8.00042C10.5477 8.45508 10.3671 8.89111 10.0456 9.2126C9.72412 9.53409 9.28808 9.7147 8.83343 9.7147C8.37877 9.7147 7.94273 9.53409 7.62124 9.2126C7.29975 8.89111 7.11914 8.45508 7.11914 8.00042C7.11914 7.54576 7.29975 7.10973 7.62124 6.78824ZM13.9091 14.7884C14.2306 14.4669 14.6667 14.2863 15.1213 14.2863C15.576 14.2863 16.012 14.4669 16.3335 14.7884C16.655 15.1099 16.8356 15.5459 16.8356 16.0006C16.8356 16.4552 16.655 16.8913 16.3335 17.2127C16.012 17.5342 15.576 17.7148 15.1213 17.7148C14.6667 17.7148 14.2306 17.5342 13.9091 17.2127C13.5876 16.8913 13.407 16.4552 13.407 16.0006C13.407 15.5459 13.5876 15.1099 13.9091 14.7884Z"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="transparent"
          />
        </g>
        <defs>
          <clipPath id="clip0_15213_102026">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </SvgIcon>
  );
}

export default PercentIcon;
