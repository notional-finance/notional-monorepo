import { ReactElement } from 'react';
import { SectionLink, SectionLinkProps } from '../section-link/section-link';
import { Typography, useTheme, Box, BoxProps } from '@mui/material';

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
      <Typography
        variant="h3"
        color={theme.palette.primary.light}
        sx={{
          fontSize: '1rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: '1rem',
          paddingLeft: '1rem',
        }}
      >
        {heading}
      </Typography>
      {links.map((t) => (
        <SectionLink
          key={t.to}
          title={t.title}
          to={t.to}
          icon={t.icon}
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
