import { Box, BoxProps } from '@mui/material';
import { ReactElement } from 'react';
import { SectionLink, SectionLinkProps } from '../section-link/section-link';
import SectionTitle from '../section-title/section-title';

/* eslint-disable-next-line */
export interface SectionProps extends BoxProps {
  heading: ReactElement;
  links: SectionLinkProps[];
  condensed?: boolean;
}

export function Section({ heading, links, sx, condensed = false, ...rest }: SectionProps) {
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
      <SectionTitle heading={heading} />
      {links.map((t) => (
        <SectionLink
          key={t.to}
          title={t.title}
          to={t.to}
          icon={t.icon}
          description={t.description}
          external={t.external}
          condensed={condensed}
        />
      ))}
    </Box>
  );
}

export default Section;
