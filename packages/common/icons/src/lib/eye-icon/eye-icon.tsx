import { useTheme, SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface EyeIconProps extends SvgIconProps {}

export function EyeIcon(props: EyeIconProps) {
  const { fill } = props;
  const theme = useTheme();
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 17">
        <path
          d="M12 0C6.54545 0 1.88727 3.52467 0 8.5C1.88727 13.4753 6.54545 17 12 17C17.4545 17 22.1127 13.4753 24 8.5C22.1127 3.52467 17.4545 0 12 0ZM12 14.1667C8.98909 14.1667 6.54545 11.628 6.54545 8.5C6.54545 5.372 8.98909 2.83333 12 2.83333C15.0109 2.83333 17.4545 5.372 17.4545 8.5C17.4545 11.628 15.0109 14.1667 12 14.1667ZM12 5.1C10.1891 5.1 8.72727 6.61867 8.72727 8.5C8.72727 10.3813 10.1891 11.9 12 11.9C13.8109 11.9 15.2727 10.3813 15.2727 8.5C15.2727 6.61867 13.8109 5.1 12 5.1Z"
          fill={fill || theme.palette.primary.dark}
        />
      </svg>
    </SvgIcon>
  );
}

export default EyeIcon;
