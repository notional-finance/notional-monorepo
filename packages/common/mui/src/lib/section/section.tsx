import { ReactElement } from 'react';
import { SectionLink, SectionLinkProps } from '../section-link/section-link';
import { H4 } from '../typography/typography';
import { useTheme, Box, BoxProps } from '@mui/material';

/* eslint-disable-next-line */
export interface SectionProps extends BoxProps {
  heading: ReactElement;
  links: SectionLinkProps[];
  condensed?: boolean;
}

export function Section({
  heading,
  links,
  sx,
  condensed = false,
  ...rest
}: SectionProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        padding: '1.375rem',
        ...sx,
      }}
      {...rest}
    >
      <H4
        sx={{
          fontWeight: 700,
          marginBottom: theme.spacing(3),
          color: theme.palette.typography.accent,
          marginLeft: theme.spacing(1),
          textTransform: 'uppercase',
        }}
      >
        {heading}
      </H4>
      {links.map((t) => (
        <SectionLink
          key={t.to}
          title={t.title}
          to={t.to}
          icon={t.icon}
          pillText={t.pillText}
          description={t.description}
          external={t.external}
          condensed={condensed}
          hideBorder={t.hideBorder}
        />
      ))}
    </Box>
  );
}

export default Section;
