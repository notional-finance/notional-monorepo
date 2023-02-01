import { styled, Box, useTheme, SxProps } from '@mui/material';

/* eslint-disable-next-line */
export interface SideDrawerButtonProps {
  children: any;
  onClick?: () => void;
  sx?: SxProps;
}

export function SideDrawerButton({
  children,
  sx,
  onClick,
}: SideDrawerButtonProps) {
  const theme = useTheme();
  return (
    <Button theme={theme} sx={{ ...sx }} onClick={onClick}>
      {children}
    </Button>
  );
}

const Button = styled(Box)(
  ({ theme }) => `
  padding: ${theme.spacing(2.5)};
  margin-bottom: ${theme.spacing(2)};
  border-radius: ${theme.shape.borderRadius()};
  background: ${theme.palette.background.default};
  display: flex;
  align-items: center;
  `
);

export default SideDrawerButton;
