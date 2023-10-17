import { styled, useTheme, SxProps, alpha } from '@mui/material';
import { colors } from '@notional-finance/styles';
import React from 'react';
import { ButtonText } from '../typography/typography';
import { Button as _Button } from '../button/button';

export interface SideDrawerButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  sx?: SxProps;
  to?: string;
  variant?: 'contained' | 'outlined';
}

// NOTE: The text for the button must be wrapped in a H4
export function SideDrawerButton({
  children,
  sx,
  onClick,
  to,
  variant = 'contained',
}: SideDrawerButtonProps) {
  const theme = useTheme();
  return (
    <Button theme={theme} sx={sx} onClick={onClick} variant={variant} to={to}>
      {children}
    </Button>
  );
}

const Button = styled(_Button)(
  ({ theme }) => `
  height: ${theme.spacing(10)};
  padding: ${theme.spacing(2)};
  margin-bottom: ${theme.spacing(2)};
  border-radius: ${theme.shape.borderRadiusLarge};
  background: ${theme.palette.info.light};
  display: flex;
  justify-content: start;
  align-items: center;
  width: 100%;
  box-shadow: unset;
  transition: all .3s ease;
  &:hover {
    background: ${alpha(colors.aqua, 0.5)};
    box-shadow: unset;
  }
  `
);

export const ButtonData = styled(ButtonText)(
  ({ theme }) => `
    float: right;
    border: ${theme.shape.borderStandard};
    border-color: ${theme.palette.primary.light};
    background: ${theme.palette.background.paper};
    padding: ${theme.spacing(1, 2)};
    border-radius: ${theme.shape.borderRadius()};
    color: ${theme.palette.common.black};
    margin-bottom: 0px;
  `
);

export default SideDrawerButton;
