import { useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Card as MuiCard, CardProps as MuiCardProps } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';

 
export interface CardProps extends MuiCardProps {
  children: React.ReactNode;
  height?: string;
}

interface StyledCardProps {
  theme: NotionalTheme;
  height?: string;
}

const StyledCard = styled(MuiCard)(
  ({ theme, height }: StyledCardProps) => `
    border-radius: ${theme.shape.borderRadiusLarge};
    background: ${theme.palette.background.paper};
    border: ${theme.shape.borderStandard};
    width: ${theme.spacing(38)};
    height: ${height};
    margin-top: ${theme.spacing(6)};
    padding: ${theme.spacing(3)};
    cursor: pointer;
    text-align: center;
    position: relative;
    box-shadow: ${theme.shape.shadowLarge()};
    overflow: visible;
    transition: 0.3s ease;
    a {
      position: relative;
    }

    ${theme.gradient.hoverTransition(
      theme.palette.background.paper,
      theme.palette.info.light
    )}

    &:hover {
      box-shadow: ${theme.shape.shadowLarge(theme.palette.secondary.accent)};
      transition: 0.3s ease;
      transform: scale(1.1);
    }
  `
);

export function Card({ children, height = '15', ...rest }: CardProps) {
  const theme = useTheme() as NotionalTheme;

  return (
    <StyledCard theme={theme} height={height} {...rest}>
      <div role="presentation">{children}</div>
    </StyledCard>
  );
}

export default Card;
