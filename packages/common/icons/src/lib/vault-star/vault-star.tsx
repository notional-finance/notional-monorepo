/* eslint-disable-next-line */
import { SvgIcon, SvgIconProps } from '@mui/material';

/* eslint-disable-next-line */
export interface VaultStarProps extends SvgIconProps {}

export function VaultStar(props: VaultStarProps) {
  return (
    <SvgIcon {...props} width="31" height="31" viewBox="0 0 31 31">
      <path
        d="M15.5 4.93182L17.2222 13.7778L26.0682 15.5L17.2222 17.2222L15.5 26.0682L13.7778 17.2222L4.93182 15.5L13.7778 13.7778L15.5 4.93182ZM15.5 0L11.2727 11.2727L0 15.5L11.2727 19.7273L15.5 31L19.7273 19.7273L31 15.5L19.7273 11.2727L15.5 0Z"
        fill="white"
      />
    </SvgIcon>
  );
}

export default VaultStar;
