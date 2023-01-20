import { styled, Box, useTheme, SxProps } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';

/* eslint-disable-next-line */
export interface SideDrawerButtonProps {
  children: any;
  onClick?: () => void;
  clickable?: boolean;
  sx?: SxProps;
}
interface ButtonProps {
  theme: NotionalTheme;
  clickable?: boolean;
}

export function SideDrawerButton({
  children,
  sx,
  clickable = true,
}: SideDrawerButtonProps) {
  const theme = useTheme();
  return (
    <Button theme={theme} clickable={clickable} sx={{ ...sx }}>
      {children}
    </Button>
  );
}

const Button = styled(Box)(
  ({ theme, clickable }: ButtonProps) => `
  padding: ${theme.spacing(2.5)};
  margin-bottom: ${theme.spacing(2)};
  border-radius: ${theme.shape.borderRadius()};
  cursor: ${clickable ? 'pointer' : 'normal'};
  background: ${theme.palette.background.default};
  display: flex;
  align-items: center;
  `
);

export default SideDrawerButton;
