import { useTheme } from '@mui/material';
import degenScore from './overlay-icons/ds_icon.svg';
export interface IconImg {
  name: string;
  img: string;
  alt: string;
}
export interface IconImageMap {
  [key: string]: IconImg;
}
export const IconList: IconImageMap = {
  degenscore: {
    name: 'degenscore',
    img: degenScore,
    alt: 'degen score icon',
  },
};

export interface VaultCardIconProps {
  iconName: string;
  style?: React.CSSProperties;
}

export function VaultCardIcon({ iconName, style }: VaultCardIconProps) {
  const theme = useTheme();
  const iconKey = iconName?.toLowerCase();
  const icon: IconImg = Object.keys(IconList).includes(iconKey)
    ? IconList[iconKey]
    : IconList['unknown'];

  return (
    <img
      width={theme.spacing(5)}
      height={theme.spacing(5)}
      src={icon.img}
      alt={icon.alt}
      style={{
        ...style,
      }}
    />
  );
}

export default VaultCardIcon;
