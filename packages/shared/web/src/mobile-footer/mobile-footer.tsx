import { Box, styled, useTheme } from '@mui/material';
import { Caption, ExternalLink } from '@notional-finance/mui';
import {
  DiscordPlainIcon,
  TwitterPlainIcon,
  YoutubeIcon,
} from '@notional-finance/icons';

export const MobileFooter = () => {
  const theme = useTheme();
  return (
    <>
      <Box
        sx={{
          width: '100%',
          height: '1px',
          backgroundColor: theme.palette.borders.paper,
        }}
      />
      <MainContainer>
        <LinkContainer>
          <Caption href="https://docs.notional.finance/notional-v3">
            Documentation
          </Caption>
          <Caption href="https://dune.com/notional_team/notional-dashboard">
            Dune Dashboards
          </Caption>
          <Caption to="/note">NOTE</Caption>
        </LinkContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
          <ExternalLink href="https://discord.notional.finance">
            <DiscordPlainIcon />
          </ExternalLink>
          <ExternalLink href="https://twitter.com/notionalfinance">
            <TwitterPlainIcon />
          </ExternalLink>
          <ExternalLink href="https://www.youtube.com/@notionalfinance3816">
            <YoutubeIcon />
          </ExternalLink>
        </Box>
      </MainContainer>
    </>
  );
};

const MainContainer = styled(Box)(
  ({ theme }) => `
    display: none;
    ${theme.breakpoints.down('sm')} {
      width: 80%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      margin-bottom: ${theme.spacing(13)};
    };
    `
);

const LinkContainer = styled(Box)(
  ({ theme }) => `
    padding: ${theme.spacing(3, 0)};
    display: flex;
    justify-content: space-between;
    align-items: center;
    `
);
