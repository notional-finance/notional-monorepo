import { SvgIcon, SvgIconProps } from '@mui/material';

 
export interface ReceivedIconProps extends SvgIconProps {
  fill: string;
}

export const ReceivedIcon = (props: ReceivedIconProps) => {
  const { fill } = props;
  return (
    <SvgIcon {...props}>
      <rect width="24" height="24" rx="12" fill={fill} fillOpacity="0.15" />
      <path d="M6 18V19.25H18V18H6Z" fill={fill} />
      <path
        d="M11.3529 5V13.5394L7.93212 10.1577L7 11.0795L11.5343 15.5602L12 16L12.4657 15.5602L17 11.0795L16.0685 10.159L12.6484 13.5388V5H11.3529Z"
        fill={fill}
      />
    </SvgIcon>
  );
};
