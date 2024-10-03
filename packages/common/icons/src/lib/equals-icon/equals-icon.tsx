import { SvgIcon, SvgIconProps, useTheme } from '@mui/material';

 
export interface EqualsIconProps extends SvgIconProps {
  fill?: string;
}

export function EqualsIcon(props: EqualsIconProps) {
  const theme = useTheme();
  const { fill } = props;
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 41 23">
        <path
          d="M41 0V8.31915H0V0H41ZM41 14.6809V23H0V14.6809H41Z"
          fill={fill || theme.palette.primary.dark}
        />
      </svg>
    </SvgIcon>
  );
}

export default EqualsIcon;
