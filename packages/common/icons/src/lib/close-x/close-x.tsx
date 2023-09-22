import { SvgIcon, SvgIconProps, SxProps } from '@mui/material';

/* eslint-disable-next-line */
export interface CloseXProps extends SvgIconProps {
  stroke?: string;
  sx?: SxProps;
}

export function CloseX(props: CloseXProps) {
  const { stroke = '#004453' } = props;
  return (
    <SvgIcon {...props}>
      <path
        stroke={stroke}
        d="M19 1L1 19"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        stroke={stroke}
        d="M1 1L19 19"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}

export default CloseX;
