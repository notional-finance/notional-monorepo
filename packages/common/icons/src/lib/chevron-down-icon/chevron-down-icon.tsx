import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface ChevronDownIconProps extends SvgIconProps {}

export function ChevronDownIcon(props: ChevronDownIconProps) {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 22">
        <rect width="22" height="22" rx="11" fill="#13BBC2" />
        <path
          d="M11 16L5 9.64706L6.55556 8L11 12.7059L15.4444 8L17 9.64706L11 16Z"
          fill="white"
        />
      </svg>
    </SvgIcon>
  );
}

export default ChevronDownIcon;
