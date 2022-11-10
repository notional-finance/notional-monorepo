import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface ResourcesIconProps extends SvgIconProps {}

export function ResourcesIcon(props: ResourcesIconProps) {
  return (
    <SvgIcon {...props}>
      <path id="checkmark" d="M10.2,12.5L8,10.3l-1.2,1.2l3.4,3.4L17,8.1l-1.2-1.2L10.2,12.5z" />
      <path
        id="shield"
        d="M12,24l-5.3-2.8c-1.5-0.8-2.8-2-3.7-3.5c-0.9-1.5-1.3-3.1-1.3-4.9V1.7c0-0.5,0.2-0.9,0.5-1.2
        C2.5,0.2,3,0,3.4,0h17.1c0.5,0,0.9,0.2,1.2,0.5c0.3,0.3,0.5,0.8,0.5,1.2v11.1c0,1.7-0.5,3.4-1.3,4.9c-0.9,1.5-2.1,2.7-3.7,3.5L12,24
        z M3.4,1.7v11.1c0,1.4,0.4,2.8,1.1,4c0.7,1.2,1.8,2.2,3,2.8l4.5,2.4l4.5-2.4c1.2-0.7,2.3-1.6,3-2.8c0.7-1.2,1.1-2.6,1.1-4V1.7H3.4z"
      />
    </SvgIcon>
  );
}

export default ResourcesIcon;
