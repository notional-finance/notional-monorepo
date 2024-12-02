import { useEffect } from 'react';
import { alpha, Box, Button, styled, ThemeProvider } from '@mui/material';
import {
  Body,
  Caption,
  CurrencyTitle,
  DataTable,
  H1,
  H2,
  H4,
  TABLE_VARIANTS,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import discordIcon from '@notional-finance/assets/images/logos/discord-two-tone.svg';
import twitterIcon from '@notional-finance/assets/images/logos/twitter-two-tone.svg';
import { colors, useNotionalTheme } from '@notional-finance/styles';
import { useProductsTable } from './use-products-table';
import { Network, THEME_VARIANTS } from '@notional-finance/util';
import { useNetworkToggle } from '../AnalyticsViews/hooks';
import newcomer from './newcomer.png';
import { useNavigate } from 'react-router-dom';
import { useWalletAddress } from '@notional-finance/notionable-hooks';
import { fetchNewcomerBoostData } from '@notional-finance/helpers';

export const NewUserView = () => {
  const navigate = useNavigate();
  const selectedAccount = useWalletAddress();
  const landingTheme = useNotionalTheme(THEME_VARIANTS.LIGHT, 'landing');
  const productTheme = useNotionalTheme(THEME_VARIANTS.LIGHT, 'product');
  const networkToggleData = useNetworkToggle();
  const selectedNetwork: Network =
    networkToggleData.toggleKey === 0 ? Network.arbitrum : Network.mainnet;
  const { productsTableColumns, productsTableData } =
    useProductsTable(selectedNetwork);

  useEffect(() => {
    const loadEligibleAddresses = async () => {
      const eligibleAddresses = await fetchNewcomerBoostData();
      if (selectedAccount && eligibleAddresses.length > 0) {
        const ineligible = !eligibleAddresses
          .map((addr) => addr.toLowerCase())
          .includes(selectedAccount.toLowerCase());
        if (ineligible) {
          navigate('/');
        }
      }
    };
    loadEligibleAddresses();
  }, [selectedAccount, navigate]);

  return (
    <ThemeProvider theme={landingTheme}>
      <Box sx={{ background: colors.iceWhite }}>
        <TopContainer>
          <Box
            sx={{
              background: colors.iceWhite,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'start',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <H1>
                  <FormattedMessage defaultMessage={'Newcomer'} />
                </H1>
                <H1>
                  <FormattedMessage defaultMessage={'Starter Boost'} />
                </H1>
              </Box>

              <Body
                sx={{
                  width: { md: '100%', lg: '550px' },
                  marginTop: landingTheme.spacing(4),
                }}
              >
                <FormattedMessage
                  defaultMessage={
                    'Lend now on Notional and receive an APY boost for all new users for the first 30 days.'
                  }
                />
              </Body>
              <DateBox>
                <Caption sx={{ textTransform: 'uppercase' }}>
                  <FormattedMessage defaultMessage={'Promotion Dates'} />
                </Caption>
                <H4>
                  <FormattedMessage
                    defaultMessage={'Nov 26th - Dec 10th 2024'}
                  />
                </H4>
              </DateBox>
            </Box>
            <Box>
              <img
                src={newcomer}
                alt="rocket"
                style={{ height: '600px', width: '560px' }}
              />
            </Box>
          </Box>
        </TopContainer>
        <Box
          sx={{
            marginTop: `-${landingTheme.spacing(25)}`,
            width: '100%',
            height: landingTheme.spacing(50),
            borderStyle: 'solid',
            borderWidth: `0 0 ${landingTheme.spacing(
              25
            )} ${landingTheme.spacing(350)}`,
            borderColor: 'transparent transparent #FFFFFF transparent',
            transform: 'rotate(0deg)',
          }}
        />
        <Box
          sx={{
            background: colors.white,
          }}
        >
          <TextContainer>
            <Body sx={{ marginBottom: landingTheme.spacing(6) }}>
              <FormattedMessage
                defaultMessage={
                  'Introducing the Newcomer Starter Boost Program: new users get an extra 5% APY for their first week when they deposit USDC or ETH on Mainnet or Arbitrum! Get ready to boost your earnings!'
                }
              />
            </Body>

            <Box sx={{ marginBottom: landingTheme.spacing(6) }}>
              <CurrencyTitle
                sx={{
                  color: landingTheme.palette.typography.main,
                  marginBottom: landingTheme.spacing(2),
                }}
              >
                <FormattedMessage defaultMessage={'Campaign Details'} />
              </CurrencyTitle>
              <Body>
                <FormattedMessage defaultMessage="• Users must deposit at least 5,000 USDC or 2 ETH" />
              </Body>
              <Body>
                <FormattedMessage defaultMessage="• Users can deposit in any earn product: lending, fixed rate lending, or provide liquidity" />
              </Body>
              <Body>
                <FormattedMessage defaultMessage="• Bonus APY is paid in deposit token (USDC or ETH)" />
              </Body>
              <Body>
                <FormattedMessage defaultMessage="• Users can deposit any time between November 26th and December 10th" />
              </Body>
            </Box>
            <Box sx={{ marginBottom: landingTheme.spacing(6) }}>
              <CurrencyTitle
                sx={{
                  color: landingTheme.palette.typography.main,
                  marginBottom: landingTheme.spacing(2),
                }}
              >
                <FormattedMessage defaultMessage={'Eligibility'} />
              </CurrencyTitle>
              <Body>
                <FormattedMessage defaultMessage="• Wallet must not have used Notional before" />
              </Body>
              <Body>
                <FormattedMessage defaultMessage="• Must not withdraw for at least 30 days after deposit" />
              </Body>
              <Body>
                <FormattedMessage defaultMessage="• Individual users can deposit up to 500,000 USDC or 200 ETH" />
              </Body>
              <Body>
                <FormattedMessage defaultMessage="• Only the first 5M USDC and 2000 ETH deposited by new users are eligible for rewards" />
              </Body>
            </Box>
            <Box sx={{ marginBottom: landingTheme.spacing(6) }}>
              <CurrencyTitle
                sx={{
                  color: landingTheme.palette.typography.main,
                  marginBottom: landingTheme.spacing(2),
                }}
              >
                <FormattedMessage defaultMessage={'Reward Distribution'} />
              </CurrencyTitle>
              <Body>
                <FormattedMessage defaultMessage="• Reward tokens will be transferred to eligible users on January 15th" />
              </Body>
            </Box>
          </TextContainer>
          <TableContainer>
            <CurrencyTitle
              sx={{
                color: landingTheme.palette.typography.main,
                marginBottom: landingTheme.spacing(2),
              }}
            >
              <FormattedMessage defaultMessage={'Qualifying Products'} />
            </CurrencyTitle>
            <ThemeProvider theme={productTheme}>
              <DataTable
                data={productsTableData}
                columns={productsTableColumns}
                tableVariant={TABLE_VARIANTS.SORTABLE}
                networkToggleData={networkToggleData}
                sx={{
                  boxShadow: landingTheme.shape.shadowLarge(),
                }}
              />
            </ThemeProvider>
          </TableContainer>
        </Box>
        <Box
          sx={{
            background: colors.iceWhite,
          }}
        >
          <ContactContainer>
            <H2>
              <FormattedMessage defaultMessage={'Contact Us'} />
            </H2>
            <Body sx={{ marginTop: landingTheme.spacing(2) }}>
              <FormattedMessage
                defaultMessage={
                  'Questions about the program? Join the Notional community to stay up to date and get your questions answered!'
                }
              />
            </Body>
            <ButtonContainer>
              <Button
                href="https://discord.notional.finance"
                target="_blank"
                sx={{
                  background: colors.white,
                  color: colors.black,
                  width: landingTheme.spacing(30),
                  height: landingTheme.spacing(7),
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: landingTheme.shape.borderRadius(),
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': {
                    background: alpha(colors.aqua, 0.15),
                  },
                }}
              >
                <img
                  src={discordIcon}
                  alt="icon"
                  style={{
                    height: landingTheme.spacing(3),
                    marginRight: landingTheme.spacing(1),
                  }}
                />
                <FormattedMessage defaultMessage={'Discord'} />
              </Button>
              <Button
                href="https://twitter.com/NotionalFinance"
                target="_blank"
                sx={{
                  background: colors.white,
                  color: colors.black,
                  width: landingTheme.spacing(30),
                  height: landingTheme.spacing(7),
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: landingTheme.shape.borderRadius(),
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': {
                    background: alpha(colors.aqua, 0.15),
                  },
                }}
              >
                <img
                  src={twitterIcon}
                  alt="icon"
                  style={{
                    height: landingTheme.spacing(3),
                    marginRight: landingTheme.spacing(1),
                  }}
                />
                <FormattedMessage defaultMessage={'Twitter'} />
              </Button>
            </ButtonContainer>
          </ContactContainer>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

const TopContainer = styled(Box)(
  ({ theme }) => `
    max-width: ${theme.spacing(150)};
    margin: 0px auto;
    padding-top: ${theme.spacing(10)};
    ${theme.breakpoints.down('md')} {
      h1 {
       font-size: 28px;
      }
      width: 90%;
    }
    ${theme.breakpoints.down('sm')} {
      img {
        display: none;
      }
    }
    `
);

const TextContainer = styled(Box)(
  ({ theme }) => `
      max-width: ${theme.spacing(100)};
      margin: 0 auto;
      ${theme.breakpoints.down('md')} {
        width: 90%;
      }
    `
);

const TableContainer = styled(Box)(
  ({ theme }) => `
    max-width: ${theme.spacing(160)};
    margin: 0px auto;
    padding-top: ${theme.spacing(6)};
    padding-bottom: ${theme.spacing(15)};
    ${theme.breakpoints.down('md')} {
      width: 90%;
    }
    `
);

const ContactContainer = styled(Box)(
  ({ theme }) => `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      max-width: ${theme.spacing(100)};
      height: ${theme.spacing(62.5)};
      margin: 0 auto;
      text-align: center;
      ${theme.breakpoints.down('md')} {
        width: 90%;
      }
    `
);
const ButtonContainer = styled(Box)(
  ({ theme }) => `
      display: flex;
      gap: ${theme.spacing(6)};
      margin-top: ${theme.spacing(6)};
      ${theme.breakpoints.down('md')} {
        flex-direction: column;
        align-items: center;
      }
    `
);

const DateBox = styled(Box)(
  ({ theme }) => `
    background: ${colors.purpleGrey};
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-top: ${theme.spacing(10)};
    padding: ${theme.spacing(2)} ${theme.spacing(4)};
    border-radius: ${theme.shape.borderRadius()};
    width: fit-content;
    ${theme.breakpoints.down('md')} {
      width: 100%;
    };
    `
);

export default NewUserView;
