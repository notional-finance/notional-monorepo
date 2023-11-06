import { FormattedMessage } from 'react-intl';
import { styled, Box, ThemeProvider } from '@mui/material';
import { DiscordFooter } from '@notional-finance/icons';
import logoForDarkBackground from '@notional-finance/assets/images/logos/Notional_logo_for_dark_background.svg';
import { useNotionalTheme } from '@notional-finance/styles';
import { useLastUpdateBlockNumber } from '@notional-finance/notionable-hooks';
import { formatNumber, formatNumberAsPercent } from '@notional-finance/helpers';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import { useCryptoPriceState } from '../crypto-price-manager/store/use-crypto-price-state';
import { useCryptoPriceManager } from '../crypto-price-manager/use-crypto-price-manager';
import {
  ExternalLink,
  H4,
  HeadingSubtitle,
  Label,
} from '@notional-finance/mui';

const FooterLeft = styled(Box)(
  ({ theme }) => `
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  text-align: left;
  margin-bottom: ${theme.spacing(8)};

  ${theme.breakpoints.up('md')} {
    margin-bottom: 0px;
    margin-left: 0px;
  }
`
);

const Logo = styled('img')`
  height: 28px;
  margin-bottom: 48px;
`;

const FooterCenter = styled(Box)(
  ({ theme }) => `
  display: block;
  text-align: left;
  margin-bottom: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.values.md}px) {
    margin-bottom: 0px;
    margin-left: 0px;
  }
`
);

const FooterRight = styled(Box)`
  display: block;
  text-align: right;
`;

// NOTE* this border is hard coded because it goes against the light theme settings.
const StyledFooter = styled(Box)(
  ({ theme }) => `
  z-index: 5;
  background: ${theme.palette.background.accentDefault};
  border-top: 1px solid #3B7A8B;
  width: 100%;
  text-align: center;
  display: inline-flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: ${theme.spacing(7)};
  padding-bottom: ${theme.spacing(7)};
  align-items: center;

  ${theme.breakpoints.up('md')} {
    flex-direction: row;
    align-items: flex-start;
    padding-left: ${theme.spacing(15)};
    padding-right: ${theme.spacing(15)};
  }
  ${theme.breakpoints.down('md')} {
    align-items: flex-start;
    padding: ${theme.spacing(8, 4)};
  }
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
`
);

// NOTE* background-color intentionally hard coded
const StatusBox = styled(Box)(
  ({ theme }) => `
  border-radius: ${theme.shape.borderRadiusLarge};
  background-color: #013D4A;
  padding: ${theme.spacing(1.5)};
  text-align: left;
`
);

const LatestSyncedBlock = styled(Box)(
  ({ theme }) => `
  padding-top: ${theme.spacing(1)};
  padding-bottom: ${theme.spacing(1)};
  padding-left: ${theme.spacing(2)};
  padding-right: ${theme.spacing(2)};
  border-radius: ${theme.shape.borderRadius()};
  color: ${theme.palette.borders.accentPaper};
  background-color: ${theme.palette.background.accentDefault};
  display: flex;
  align-items: baseline;

  .blocknum {
    margin-left: ${theme.spacing(1)};
    color: ${theme.palette.success.accent};
  }
`
);

const StatusDot = styled(Box)(
  ({ theme }) => `
  width: ${theme.spacing(1)};
  height: ${theme.spacing(1)};
  margin-left: ${theme.spacing(1)};
  border-radius: 50%;
  align-self: center;
`
);

export const Footer = () => {
  useCryptoPriceManager();
  const theme = useNotionalTheme(THEME_VARIANTS.LIGHT);
  const lastUpdateBlockNumber = useLastUpdateBlockNumber();
  const { cryptoPrices } = useCryptoPriceState();
  const statusOk = lastUpdateBlockNumber !== undefined;

  const currentETHPrice = cryptoPrices['eth']
    ? `$${formatNumber(cryptoPrices['eth'].price, 2)}`
    : '-';
  const currentETHPercentChange = cryptoPrices['eth']
    ? cryptoPrices['eth']['24H']
    : 0;

  return (
    <ThemeProvider theme={theme}>
      <StyledFooter>
        <FooterLeft>
          <Logo src={logoForDarkBackground} alt="Notional Finance logo" />
          <H4
            contrast
            href="mailto:support@notional.finance"
            marginBottom={theme.spacing(4)}
          >
            <FormattedMessage
              defaultMessage={'Need Help? Contact the Notional team.'}
            />
          </H4>
          <ExternalLink
            href="https://discord.notional.finance"
            style={{ marginBottom: theme.spacing(3) }}
          >
            <DiscordFooter />
          </ExternalLink>
        </FooterLeft>
        <FooterCenter>
          <Label accent uppercase marginBottom={theme.spacing(4)}>
            <FormattedMessage
              defaultMessage="Resources"
              description="footer link"
            />
          </Label>
          <HeadingSubtitle
            contrast
            href="https://docs.notional.finance/notional-v2/faq"
            marginBottom={theme.spacing(4)}
          >
            <FormattedMessage
              defaultMessage="User Documentation"
              description="footer link"
            />
          </HeadingSubtitle>
          <HeadingSubtitle
            contrast
            href="https://www.youtube.com/playlist?list=PLnKdM8f8QEJ2lJ59ZjhVCcJvrT056X0Ga"
            marginBottom={theme.spacing(4)}
          >
            <FormattedMessage
              defaultMessage="Video Tutorials"
              description="footer link"
            />
          </HeadingSubtitle>
          <HeadingSubtitle
            contrast
            href="https://info.notional.finance/"
            marginBottom={theme.spacing(4)}
          >
            <FormattedMessage
              defaultMessage="Dashboard"
              description="footer link"
            />
          </HeadingSubtitle>
        </FooterCenter>
        <FooterRight>
          <StatusBox>
            <LatestSyncedBlock>
              <Label>
                <FormattedMessage
                  defaultMessage="Last Synced Block: {number}"
                  description="footer link"
                  values={{
                    number: (
                      <span style={{ color: theme.palette.success.accent }}>
                        {lastUpdateBlockNumber}
                      </span>
                    ),
                  }}
                />
              </Label>
              <StatusDot
                sx={{
                  backgroundColor: statusOk
                    ? theme.palette.success.accent
                    : theme.palette.error.main,
                  boxShadow: '1px',
                }}
              />
            </LatestSyncedBlock>
            <Label contrast textAlign="center" marginTop={theme.spacing(1)}>
              <FormattedMessage
                defaultMessage={'ETH Price: {currentETHPrice} {priceChange}'}
                values={{
                  currentETHPrice,
                  priceChange: (
                    <span
                      style={{
                        marginLeft: theme.spacing(0.5),
                        color:
                          currentETHPercentChange > 0
                            ? theme.palette.success.accent
                            : theme.palette.error.main,
                      }}
                    >
                      {`(${formatNumberAsPercent(currentETHPercentChange)})`}
                    </span>
                  ),
                }}
              />
            </Label>
          </StatusBox>
        </FooterRight>
      </StyledFooter>
    </ThemeProvider>
  );
};

export default Footer;
