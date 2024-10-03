import { SvgIcon, SvgIconProps } from '@mui/material';

 
export interface ArrowRightIconProps extends SvgIconProps {
  fill?: string;
}

export function ArrowRightIcon(props: ArrowRightIconProps) {
  const { fill = '#33F8FF' } = props;
  return (
    <SvgIcon {...props} viewBox="0 0 14 14">
      <path
        d="M0 7.875L10.6488 7.875L5.7575 12.7663L7 14L14 7L7 0L5.76625 1.23375L10.6488 6.125L0 6.125L0 7.875Z"
        fill={fill}
      />
    </SvgIcon>
  );
}

export default ArrowRightIcon;
