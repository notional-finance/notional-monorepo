import { ReactElement } from 'react';
import { SectionLink, SectionLinkProps } from '../section-link/section-link';
import { H3 } from '../typography/typography';
import { Box, BoxProps } from '@mui/material';

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
      <H3>{heading}</H3>
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
