import { SvgIcon, SvgIconProps } from '@mui/material';

 
export interface SentIconProps extends SvgIconProps {
  fill: string;
}

export const SentIcon = (props: SentIconProps) => {
  const { fill } = props;
  return (
    <SvgIcon {...props}>
      <rect width="24" height="24" rx="12" fill={fill} fillOpacity="0.15" />
      <path d="M6 18V19.25H18V18H6Z" fill={fill} />
      <path
        d="M11.3529 16V7.46059L7.93212 10.8423L7 9.92054L11.5343 5.43976L12 5L12.4657 5.43976L17 9.92054L16.0685 10.841L12.6484 7.46123V16H11.3529Z"
        fill={fill}
      />
    </SvgIcon>
  );
};
