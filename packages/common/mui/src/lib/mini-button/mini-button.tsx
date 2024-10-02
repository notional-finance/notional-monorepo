import * as React from 'react';
import { Button, ButtonProps, SvgIcon, useTheme, styled } from '@mui/material';
import { ReactNode } from 'react';

 
export interface MiniButtonProps extends ButtonProps {
  label?: ReactNode;
  icon?: React.ElementType<typeof SvgIcon>;
  isVisible?: boolean;
}

const StyledMiniButton = styled(Button)(
  ({ theme, hidden }) => `
  text-transform: uppercase;
  font-size: .6rem;
  font-weight: 600;
  border-radius: ${theme.shape.borderRadius()};
  padding: .250rem .625rem .250rem .625rem;
  letter-spacing: 1px;
  min-width: unset;
  min-height: unset;
  max-height: 2rem;
  line-height: 1.4;
  align-self: center;
  background-color: ${theme.palette.primary.light};
  box-shadow: unset;
  visibility: ${hidden ? 'hidden' : 'visible'};

  &:hover {
    box-shadow: unset;
    background-color: ${theme.palette.primary.light};
  };

  &.MuiButton-startIcon {
    width: 10px;'
  }
`
);

export function MiniButton({
  label = '',
  isVisible = true,
  icon,
  children,
  ...rest
}: MiniButtonProps) {
  const theme = useTheme();
  return (
    <StyledMiniButton
      {...rest}
      variant="contained"
      size="small"
      theme={theme}
      hidden={!isVisible}
      startIcon={icon ? React.createElement(icon, { sx: { width: '14px' } } as any) : null}
    >
      {label}
      {children}
    </StyledMiniButton>
  );
}

export default MiniButton;
