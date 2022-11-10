import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface NotionalPlainIconProps extends SvgIconProps {}

export function NotionalPlainIcon(props: NotionalPlainIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M22.1,2.2h-1.8v17.9l1.8,1.8V2.2z" />
      <path d="M18.4,2.2h-1.8v14.3l1.8,1.8V2.2z" />
      <path d="M14.8,2.2H13v10.7l1.8,1.8V2.2z" />
      <path d="M9.4,9.3v12.6h1.8V11.1L9.4,9.3z" />
      <path d="M5.8,5.7v16.2h1.8V7.5L5.8,5.7z" />
      <path d="M2.3,2.2L2.3,2.2L2.2,21.9H4v-18L2.3,2.2z" />
    </SvgIcon>
  );
}

export default NotionalPlainIcon;
