import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface TokenTerminalIcon extends SvgIconProps {}

export function TokenTerminalIcon(props: TokenTerminalIcon) {
  return (
    <SvgIcon {...props} viewBox="0 0 18 18">
      <path
        d="M9.84324 14.0258V16.792H5.75871C5.02959 16.7913 4.33052 16.5014 3.81495 15.9859C3.29939 15.4703 3.00947 14.7712 3.00886 14.0421V6.58705H0V3.87686H3.00302V0H6.10288V3.87336H9.84324V6.58705H6.10288V14.0246H9.84324V14.0258Z"
        fill="#013D4A"
      />
      <path
        d="M11.6641 16.7914V14.0205H21.9973V16.7914H11.6641Z"
        fill="#013D4A"
      />
    </SvgIcon>
  );
}

export default TokenTerminalIcon;
