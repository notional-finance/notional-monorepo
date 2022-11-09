import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface DashboardIconProps extends SvgIconProps {}

export function DashboardIcon(props: DashboardIconProps) {
  return (
    <SvgIcon {...props}>
      <path
        d="M4 11H10V17H4V11Z"
        stroke="#004453"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16.5 14.25H18V18H16.5V14.25Z" />
      <path d="M13.5 10.5H15V18H13.5V10.5Z" />
      <path d="M19.5 0H1.5C1.1023 0.000397108 0.720997 0.15856 0.439778 0.439778C0.15856 0.720997 0.000397108 1.1023 0 1.5V19.5C0.000397108 19.8977 0.15856 20.279 0.439778 20.5602C0.720997 20.8414 1.1023 20.9996 1.5 21H19.5C19.8976 20.9994 20.2788 20.8412 20.56 20.56C20.8412 20.2788 20.9994 19.8976 21 19.5V1.5C20.9996 1.1023 20.8414 0.720997 20.5602 0.439778C20.279 0.15856 19.8977 0.000397108 19.5 0ZM19.5 6.75H9V1.5H19.5V6.75ZM7.5 1.5V6.75H1.5V1.5H7.5ZM1.5 19.5V8.25H19.5L19.5015 19.5H1.5Z" />
    </SvgIcon>
  );
}

export default DashboardIcon;
