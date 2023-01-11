import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  useTheme,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { ExternalLink } from '../external-link/external-link';

/* eslint-disable-next-line */
export interface ButtonProps extends MuiButtonProps {
  href?: string;
  to?: string;
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
      <ExternalLink href={href} fitContent>
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

export default Button;
