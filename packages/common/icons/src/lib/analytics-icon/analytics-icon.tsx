import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface AnalyticsIcon extends SvgIconProps {}

export function AnalyticsIcon(props: AnalyticsIcon) {
  return (
    <SvgIcon {...props} viewBox="0 0 21 21">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 13 13">
        <path d="M11.5556 0H1.44444C1.06135 0 0.693954 0.152182 0.423068 0.423068C0.152182 0.693954 0 1.06135 0 1.44444V11.5556C0 11.9386 0.152182 12.306 0.423068 12.5769C0.693954 12.8478 1.06135 13 1.44444 13H11.5556C11.9386 13 12.306 12.8478 12.5769 12.5769C12.8478 12.306 13 11.9386 13 11.5556V1.44444C13 1.06135 12.8478 0.693954 12.5769 0.423068C12.306 0.152182 11.9386 0 11.5556 0ZM11.9167 11.9167H1.08333V1.08333H11.9167V11.9167ZM4.33333 10.1111H2.88889V6.5H4.33333V10.1111ZM7.22222 10.1111H5.77778V5.05556H7.22222V10.1111ZM10.1111 10.1111H8.66667V2.88889H10.1111V10.1111Z" />
      </svg>
    </SvgIcon>
  );
}

export default AnalyticsIcon;
