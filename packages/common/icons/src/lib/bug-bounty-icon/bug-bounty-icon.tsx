import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface BugBountyIconProps extends SvgIconProps {}

export function BugBountyIcon(props: BugBountyIconProps) {
  return (
    <SvgIcon {...props}>
      <path
        id="outline"
        d="M20.8,5h-18C1.5,5,0.5,6,0.5,7.2v9c0,1.2,1,2.2,2.2,2.2h18c1.2,0,2.2-1,2.2-2.2v-9
        C23,6,22,5,20.8,5z M21.5,15.2c0,0.9-0.8,1.7-1.7,1.7h-16c-0.9,0-1.7-0.8-1.7-1.7V8.3c0-0.9,0.8-1.7,1.7-1.7h16
        c0.9,0,1.7,0.8,1.7,1.7V15.2z"
      />
      <path d="M11.8,14c1.2,0,2.2-1,2.2-2.2s-1-2.2-2.2-2.2s-2.2,1-2.2,2.2S10.5,14,11.8,14z" />
      <path d="M18,12.8c0.6,0,1-0.4,1-1s-0.4-1-1-1s-1,0.4-1,1S17.4,12.8,18,12.8z" />
      <path d="M5.7,12.8c0.6,0,1-0.4,1-1s-0.4-1-1-1s-1,0.4-1,1S5.1,12.8,5.7,12.8z" />
    </SvgIcon>
  );
}

export default BugBountyIcon;
