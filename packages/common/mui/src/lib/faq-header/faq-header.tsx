import { ReactNode } from 'react';
import { Box, SxProps, useTheme } from '@mui/material';
import { H2 } from '../typography/typography';
import { ExternalLink } from '../external-link/external-link';
import { ExternalLinkIcon } from '@notional-finance/icons';

 
export interface FaqHeaderProps {
  title: ReactNode;
  sx?: SxProps;
  links?: {
    href: string;
    text: ReactNode;
  }[];
}

export function FaqHeader({ title, sx, links }: FaqHeaderProps) {
  const theme = useTheme();
  return (
    <Box sx={{ marginTop: theme.spacing(5), ...sx }}>
      <H2 sx={{ marginBottom: theme.spacing(2) }}>{title}</H2>
      <Box
        sx={{
          display: 'flex',
          marginBottom: theme.spacing(2),
          marginLeft: theme.spacing(0.5),
        }}
      >
        {links &&
          links.length > 0 &&
          links.map(({ href, text }, index) => (
            <ExternalLink
              key={index}
              href={href}
              textDecoration
              accent
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {text}
              <ExternalLinkIcon
                sx={{
                  height: '12px',
                  marginRight: theme.spacing(3),
                }}
              />
            </ExternalLink>
          ))}
      </Box>
    </Box>
  );
}

export default FaqHeader;
