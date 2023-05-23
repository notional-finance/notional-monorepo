import { styled, Box, useTheme, SxProps } from '@mui/material';

/* eslint-disable-next-line */
export interface SideDrawerButtonProps {
  children: any;
  onClick?: () => void;
  sx?: SxProps;
}

// NOTE: The text for the button must be wrapped in a H4
export function SideDrawerButton({
  children,
  sx,
  onClick,
}: SideDrawerButtonProps) {
  const theme = useTheme();
  return (
    <Button
      theme={theme}
      sx={{ cursor: onClick ? 'pointer' : 'normal', ...sx }}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

const Button = styled(Box)(
  ({ theme }) => `
  height: ${theme.spacing(10)};
  padding: ${theme.spacing(2.5)};
  margin-bottom: ${theme.spacing(2)};
  border-radius: ${theme.shape.borderRadiusLarge};
  background: ${theme.palette.info.light};
  display: flex;
  align-items: center;
  transition: all .3s ease;
  &:hover {
    background: ${theme.palette.primary.light};
    h4 {
      color: ${theme.palette.common.white};
    }
  }
  `
);

export default SideDrawerButton;
