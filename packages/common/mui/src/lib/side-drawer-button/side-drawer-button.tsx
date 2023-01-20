    <Button theme={theme} clickable={clickable} sx={{ ...sx }}>
import { styled, Box, useTheme, SxProps } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';

/* eslint-disable-next-line */
export interface SideDrawerButtonProps {
  children: any;
  onClick?: () => void;
  canClick?: boolean;
  sx?: SxProps;
}
interface ButtonProps {
  theme: NotionalTheme;
  canClick?: boolean;
}

export function SideDrawerButton({
  children,
  sx,
  canClick = true,
  onClick,
}: SideDrawerButtonProps) {
  const theme = useTheme();
  return (
    <Button theme={theme} canClick={canClick} sx={{ ...sx }} onClick={onClick}>
      {children}
    </Button>
  );
}

const Button = styled(Box)(
  ({ theme, canClick }: ButtonProps) => `
  padding: ${theme.spacing(2.5)};
  margin-bottom: ${theme.spacing(2)};
  border-radius: ${theme.shape.borderRadius()};
  cursor: ${canClick ? 'pointer' : 'normal'};
  background: ${theme.palette.background.default};
  display: flex;
  align-items: center;
  `
);

export default SideDrawerButton;
