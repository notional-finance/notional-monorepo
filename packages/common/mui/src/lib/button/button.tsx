import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  styled,
  useTheme,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { ExternalLink } from '../external-link/external-link';
import { NotionalTheme, colors } from '@notional-finance/styles';

 
export interface ButtonProps extends MuiButtonProps {
  href?: string;
  to?: string;
}
interface StyledButtonProps {
  active: boolean;
  theme: NotionalTheme;
}

export function Button(props: ButtonProps) {
  const theme = useTheme();
  const { size, variant = 'contained', color, href, to, sx, ...rest } = props;

  const newProps = {
    ...rest,
    sx: {
      background: variant === 'contained' ? theme.palette.primary.light : '',
      textTransform: 'capitalize',
      fontWeight: theme.typography.button.fontWeight,
      fontSize: theme.typography.button.fontSize,
      borderRadius: theme.shape.borderRadius(),
      whiteSpace: 'nowrap',
      boxShadow: 'none',
      color:
        variant === 'outlined'
          ? theme.palette.primary.main
          : theme.palette.typography.contrastText,
      padding:
        size === 'large'
          ? theme.spacing(2, 7)
          : size === 'medium'
          ? theme.spacing(1, 5)
          : theme.spacing(1, 2),
      ':hover': {
        textDecoration: 'none',
      },

      // Allow sx properties passed in to override defaults
      ...sx,
    },
    color: color ?? 'primary',
    size: size ?? 'large',
    variant: variant ?? 'contained',
    // NOTE: removes link props from being passed to the button
    // since we add our own handlers as wrappers
    href: undefined,
    to: undefined,
  };

  if (href) {
    return (
      <ExternalLink href={href}>
        <MuiButton {...newProps} />
      </ExternalLink>
    );
  } else if (to) {
    return (
      <Link to={to}>
        <MuiButton {...newProps} />
      </Link>
    );
  } else {
    return <MuiButton {...newProps} />;
  }
}

export const StyledButton = styled(Button, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ active, theme }: StyledButtonProps) => `
    color: ${active ? colors.black : colors.white};
    background: ${active ? colors.neonTurquoise : colors.black};
    border: 1px solid ${colors.neonTurquoise};
    font-weight: 500;
    

    &:hover {
      transition: all .3s ease;
        background: ${active ? colors.neonTurquoise : theme.palette.info.light};
        color: ${active ? colors.black : colors.white};
        border: 1px solid ${colors.neonTurquoise};
    }
`
);

export default Button;
