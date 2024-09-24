// material ui
import { Theme } from '@mui/material/styles';
import { ButtonProps } from '@mui/material/Button';
import { ChipProps } from '@mui/material/Chip';
import { IconButtonProps } from '@mui/material/IconButton';
import { SliderProps } from '@mui/material/Slider';
import { LoadingButtonProps } from '@mui/lab/LoadingButton';

// ==============================|| EXTENDED COMPONENT - TYPES ||============================== //

export type ButtonVariantProps = 'contained' | 'light' | 'outlined' | 'dashed' | 'text' | 'shadow';
export type IconButtonShapeProps = 'rounded' | 'square';
type TooltipColor = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'default';
export type ColorProps =
  | ChipProps['color']
  | ButtonProps['color']
  | LoadingButtonProps['color']
  | IconButtonProps['color']
  | SliderProps['color']
  | TooltipColor;
export type AvatarTypeProps = 'filled' | 'outlined' | 'combined';
export type SizeProps = 'badge' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ExtendedStyleProps = {
  color: ColorProps;
  theme: Theme;
};
