import { useTheme } from '@mui/material';
import { trackEvent } from '@notional-finance/helpers';

interface ExternalLinkProps {
  href: string;
  children?: React.ReactNode;
  accent?: boolean;
  textDecoration?: boolean;
  fitContent?: boolean;
  style?: React.CSSProperties;
}

export const ExternalLink = ({
  href,
  children,
  accent,
  fitContent,
  textDecoration = false,
  style,
}: ExternalLinkProps) => {
  const theme = useTheme();
  return (
    <a
      href={href}
      style={{
        color: accent ? theme.palette.typography.accent : 'inherit',
        textDecoration: textDecoration ? 'underline' : 'none',
        width: fitContent ? 'fit-content' : undefined,
        height: fitContent ? 'fit-content' : undefined,
        ...style,
      }}
      target="_blank"
      rel="noreferrer"
      onClick={() =>
        trackEvent('OUTBOUND_LINK', {
          href,
          isDocs: href.includes('docs.notional.finance'),
        })
      }
    >
      {children}
    </a>
  );
};
