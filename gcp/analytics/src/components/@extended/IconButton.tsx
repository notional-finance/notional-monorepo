'use client';

import { forwardRef, ReactNode, Ref } from 'react';

// material-ui
import MuiIconButton, { IconButtonProps } from '@mui/material/IconButton';
import { alpha, styled, useTheme } from '@mui/material/styles';

// project imports
import getColors from 'utils/getColors';
import getShadow from 'utils/getShadow';

// types
import { ButtonVariantProps, ExtendedStyleProps, IconButtonShapeProps } from 'types/extended';

// ==============================|| ICON BUTTON - COLOR STYLE ||============================== //

interface IconButtonStyleProps extends ExtendedStyleProps {
  variant?: ButtonVariantProps;
}

function getColorStyle({ variant, theme, color }: IconButtonStyleProps) {
  const colors = getColors(theme, color);
  const { lighter, light, dark, main, contrastText } = colors;

  const buttonShadow = `${color}Button`;
  const shadows = getShadow(theme, buttonShadow);

  const commonShadow = {
    '&::after': {
      boxShadow: `0 0 6px 6px ${alpha(main, 0.9)}`
    },
    '&:active::after': {
      boxShadow: `0 0 0 0 ${alpha(main, 0.9)}`
    },
    '&:focus-visible': {
      outline: `2px solid ${dark}`,
      outlineOffset: 2
    }
  };

  switch (variant) {
    case 'contained':
      return {
        color: contrastText,
        background: main,
        '&:hover': {
          background: dark
        },
        ...commonShadow
      };
    case 'light':
      return {
        color: main,
        background: lighter,
        '&:hover': {
          background: alpha(light, 0.5)
        },
        ...commonShadow
      };
    case 'shadow':
      return {
        boxShadow: shadows,
        color: contrastText,
        background: main,
        '&:hover': {
          boxShadow: 'none',
          background: dark
        },
        ...commonShadow
      };
    case 'outlined':
      return {
        '&:hover': {
          background: 'transparent',
          color: dark,
          borderColor: dark
        },
        ...commonShadow
      };
    case 'dashed':
      return {
        background: lighter,
        '&:hover': {
          color: dark,
          borderColor: dark
        },
        ...commonShadow
      };
    case 'text':
    default:
      return {
        '&:hover': {
          color: dark,
          background: lighter
        },
        ...commonShadow
      };
  }
}

// ==============================|| STYLED - ICON BUTTON ||============================== //

interface StyleProps extends IconButtonStyleProps {
  shape?: IconButtonShapeProps;
}

const IconButtonStyle = styled(MuiIconButton, { shouldForwardProp: (prop) => prop !== 'variant' && prop !== 'shape' })(
  ({ theme, variant, shape, color }: StyleProps) => ({
    position: 'relative',
    '::after': {
      content: '""',
      display: 'block',
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      borderRadius: shape === 'rounded' ? '50%' : 4,
      opacity: 0,
      transition: 'all 0.5s'
    },

    ':active::after': {
      position: 'absolute',
      borderRadius: shape === 'rounded' ? '50%' : 4,
      left: 0,
      top: 0,
      opacity: 1,
      transition: '0s'
    },
    ...(shape === 'rounded' && {
      borderRadius: '50%'
    }),
    ...(variant === 'outlined' && {
      border: '1px solid',
      borderColor: 'inherit'
    }),
    ...(variant === 'dashed' && {
      border: '1px dashed',
      borderColor: 'inherit'
    }),
    ...(variant !== 'text' && {
      '&.Mui-disabled': {
        background: theme.palette.grey[200]
      }
    }),
    ...getColorStyle({ variant, theme, color })
  })
);

// ==============================|| EXTENDED - ICON BUTTON ||============================== //

export interface Props extends IconButtonProps {
  shape?: IconButtonShapeProps;
  variant?: ButtonVariantProps;
  children: ReactNode;
}

function IconButton({ variant = 'text', shape = 'square', children, color = 'primary', ...others }: Props, ref: Ref<HTMLButtonElement>) {
  const theme = useTheme();

  return (
    <IconButtonStyle ref={ref} disableRipple variant={variant} shape={shape} theme={theme} color={color} {...others}>
      {children}
    </IconButtonStyle>
  );
}

export default forwardRef(IconButton);
