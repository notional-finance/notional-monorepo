import { SvgIcon, SvgIconProps, useTheme } from '@mui/material';

/* eslint-disable-next-line */
export interface PlusIcon extends SvgIconProps {}

export function PlusIcon(props: PlusIcon) {
  const { palette } = useTheme();
  let { fill } = props;
  fill = fill ?? palette.primary.light;

  return (
    <SvgIcon
      viewBox="0 0 9 9"
      {...props}
      sx={{
        width: '9px',
        height: '9px',
        marginRight: '5px',
      }}
    >
      <rect x="3.2998" width="2.4" height="9" fill={fill} />
      <rect x="9" y="3.2998" width="2.4" height="9" transform="rotate(90 9 3.2998)" fill={fill} />
    </SvgIcon>
  );
}

export default PlusIcon;
