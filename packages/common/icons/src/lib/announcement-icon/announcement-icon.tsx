import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface AnnouncementIconProps extends SvgIconProps {}

export function AnnouncementIcon(props: AnnouncementIconProps) {
  return (
    <SvgIcon viewBox={'0 0 12 12'} {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="16" fill="#13BBC2" />
        <path
          d="M17 12.5H17.1754L17.3123 12.3904L21.5 9.04031V22.9597L17.3123 19.6096L17.1754 19.5H17H14H13.5V20V24C13.5 24.1326 13.4473 24.2598 13.3536 24.3536C13.2598 24.4473 13.1326 24.5 13 24.5H11C10.8674 24.5 10.7402 24.4473 10.6464 24.3536C10.5527 24.2598 10.5 24.1326 10.5 24V20V19.5H10H9C8.60218 19.5 8.22064 19.342 7.93934 19.0607C7.65804 18.7794 7.5 18.3978 7.5 18V14C7.5 13.6022 7.65804 13.2206 7.93934 12.9393C8.22064 12.658 8.60218 12.5 9 12.5H17ZM26 16C26 17.2333 25.4393 18.3694 24.5 19.1044V12.9031C25.4361 13.6445 26 14.7791 26 16Z"
          stroke="white"
        />
      </svg>
    </SvgIcon>
  );
}

export default AnnouncementIcon;
