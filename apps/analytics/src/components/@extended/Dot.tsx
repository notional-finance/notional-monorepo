'use client';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';

// project import
import { ColorProps } from 'types/extended';
import getColors from 'utils/getColors';

interface Props {
  color?: ColorProps;
  size?: number;
  variant?: string;
  sx?: BoxProps['sx'];
  customColor?: string;
}

export default function Dot({ color, size, variant, sx, customColor }: Props) {
  const theme = useTheme();
  const colors = getColors(theme, color || 'primary');
  const { main } = colors;

  return (
    <Box
      sx={{
        width: size || 8,
        height: size || 8,
        borderRadius: '50%',
        bgcolor: customColor ? customColor : variant === 'outlined' ? '' : main,
        ...(variant === 'outlined' && { border: '1px solid', borderColor: customColor || main }),
        ...sx
      }}
    />
  );
}
