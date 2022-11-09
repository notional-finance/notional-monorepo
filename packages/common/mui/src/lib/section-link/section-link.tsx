import { Paper, Box, useTheme, IconButton } from '@mui/material';
import { ArrowIcon } from '@notional-finance/icons';
import { ReactElement, SyntheticEvent, useState, ReactNode } from 'react';
import { useHistory } from 'react-router-dom';
import { H4, Label } from '../typography/typography';

/* eslint-disable-next-line */
export interface SectionLinkProps {
  to?: string;
  external?: boolean;
  target?: '_blank' | '_parent' | '_self' | '_top';
  icon?: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  condensed?: boolean;
}

export function SectionLink({
  to = '',
  external = true,
  target = '_blank',
  icon,
  title,
  description,
  condensed = false,
}: SectionLinkProps) {
  const theme = useTheme();
  const history = useHistory();
  const [elevation, setElevation] = useState(0);

  const handleClick = (event: SyntheticEvent) => {
    event.preventDefault();
    if (external) {
      window.open(to, target);
    } else if (to) {
      history.push(to);
    }
  };

  return (
    <Box
      sx={{
        textDecoration: 'none',
        borderBottom: `1px solid ${theme.palette.borders.default}`,
        marginRight: '30px',
      }}
      className="section-link-container"
      onMouseOver={() => setElevation(6)}
      onMouseOut={() => setElevation(0)}
      onClick={handleClick}
      href={to}
      target={target}
      rel={external && target === '_blank' ? 'noreferrer' : ''}
      component="a"
    >
      <Paper
        elevation={elevation}
        className="section-link-paper"
        sx={{
          borderRadius: theme.shape.borderRadiusLarge,
          '&.MuiPaper-root': {
            overflow: 'visible',
            display: 'flex',
            alignItems: 'center',
            padding: condensed ? '.875rem' : '1rem',
            backgroundColor: 'inherit',
            '&:hover': {
              cursor: 'pointer',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon}
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            flexDirection: 'column',
            marginLeft: '1.5rem',
            marginRight: '8px',
          }}
        >
          {/* dropdowns have the opposite theme as the page, so use contrast when the page 
              is light (therefore the drop down is dark) */}
          <H4>{title}</H4>
          <Label>{description}</Label>
        </Box>
        <Box>
          <IconButton
            sx={{
              opacity: elevation === 0 ? 0 : 1,
              background: theme.gradient.landing,
              transition: 'opacity 300ms cubic-bezier(0.4,0,0.2,1) 0ms',
            }}
          >
            <ArrowIcon
              className="section-link-arrow"
              sx={{
                transform: 'rotate(90deg)',
                color: theme.palette.common.white,
                fontSize: '.875rem',
              }}
            />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}

export default SectionLink;
