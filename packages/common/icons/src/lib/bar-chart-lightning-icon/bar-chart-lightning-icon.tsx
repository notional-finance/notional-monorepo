import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface BarCharLightningIcon extends SvgIconProps {}

export function BarCharLightningIcon(props: BarCharLightningIcon) {
  return (
    <SvgIcon {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.8618 0H23.1729V12.0635L19.8618 13.5587V0ZM16.8277 3.31029H13.5173V13.9849L14.7644 15.8536L16.8277 14.9224V3.31029ZM7.17188 6.62058H10.4822V11.6329L7.17188 14.6484V6.62058ZM0.826427 9.93113L4.13677 9.93154V17.4055L0.826427 20.4104V9.93113ZM13 24L10 19.5L0 24L11 14L14 18.5L24 14L13 24Z"
      />
    </SvgIcon>
  );
}

export default BarCharLightningIcon;
