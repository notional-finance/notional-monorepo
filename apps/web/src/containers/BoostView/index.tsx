import { useState } from 'react';
import {
  alpha,
  Box,
  Button,
  styled,
  ThemeProvider,
  useTheme,
} from '@mui/material';
import {
  Body,
  Caption,
  CurrencyTitle,
  DataTable,
  H1,
  H2,
  H4,
  Input,
  TABLE_VARIANTS,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import discordIcon from '@notional-finance/assets/images/logos/discord-two-tone-white.svg';
import twitterIcon from '@notional-finance/assets/images/logos/twitter-two-tone-white.svg';
import { colors, useNotionalTheme } from '@notional-finance/styles';
import { useProductsTable } from './use-products-table';
import { Network, THEME_VARIANTS } from '@notional-finance/util';
import { useNetworkToggle } from '../AnalyticsViews/hooks';
import tree from './tree.svg';
import { fetchBoostData } from '@notional-finance/helpers';
import { CheckmarkIcon, CloseCircleIcon } from '@notional-finance/icons';

export const BoostView = () => {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState<string>('');
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const landingTheme = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');
  const productTheme = useNotionalTheme(THEME_VARIANTS.DARK, 'product');
  const networkToggleData = useNetworkToggle();
  const selectedNetwork: Network =
    networkToggleData.toggleKey === 0 ? Network.arbitrum : Network.mainnet;
  const { productsTableColumns, productsTableData } =
    useProductsTable(selectedNetwork);

  const loadEligibleAddresses = async (address: string) => {
    const eligibleAddresses = await fetchBoostData();
    if (address && eligibleAddresses.length > 0) {
      const eligibleStatus = eligibleAddresses
        .map((addr) => addr.toLowerCase())
        .includes(address.toLowerCase());
      return eligibleStatus;
    }
    return null;
  };

  const handleChange = async (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const value = e?.target?.value;
    setInputValue(value);
    const eligible = await loadEligibleAddresses(value);
    if (eligible) {
      setIsEligible(true);
    } else if (eligible === false) {
      setIsEligible(false);
    } else {
      setIsEligible(null);
    }
  };

  return (
    <ThemeProvider theme={landingTheme}>
      <Box sx={{ background: colors.darkGreen }}>
        <TopContainer>
          <Box
            sx={{
              background: colors.darkGreen,
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
                marginRight: { sm: '0px', md: '60px', lg: '100px' },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <H1 sx={{ textWrap: 'nowrap' }}>
                  <FormattedMessage defaultMessage={'Season of Deposits'} />
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
                    'Boost your USDC deposits by at least 5,000 USDC  before December 31st and earn an extra 5% APY for two weeks. Celebrate the season of growth with Notional!'
                  }
                />
              </Body>
              <DateBox>
                <Caption sx={{ textTransform: 'uppercase' }}>
                  <FormattedMessage defaultMessage={'Promotion Dates'} />
                </Caption>
                <H4>
                  <FormattedMessage defaultMessage={'Dec 16th - 31st 2024'} />
                </H4>
              </DateBox>
            </Box>
            <Box>
              <img
                src={tree}
                alt="tree"
                style={{ height: '631px', width: '651px' }}
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
            borderColor: `transparent transparent ${colors.black} transparent`,
            transform: 'rotate(0deg)',
          }}
        />
        <Box
          sx={{
            background: colors.black,
          }}
        >
          <TextContainer>
            <Box sx={{ marginBottom: landingTheme.spacing(6) }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <CurrencyTitle
                  sx={{
                    color: landingTheme.palette.typography.main,
                    marginBottom: landingTheme.spacing(2),
                  }}
                >
                  <FormattedMessage
                    defaultMessage={'Check if you’re Eligible'}
                  />
                </CurrencyTitle>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isEligible && (
                    <CheckmarkIcon
                      fill={colors.neonTurquoise}
                      sx={{ height: theme.spacing(3), width: theme.spacing(3) }}
                    />
                  )}
                  {isEligible === false && (
                    <CloseCircleIcon
                      fill={colors.red}
                      sx={{ height: theme.spacing(3), width: theme.spacing(3) }}
                    />
                  )}
                  <H4
                    sx={{
                      fontWeight: 600,
                      fontSize: '16px',
                      marginLeft: landingTheme.spacing(1),
                      color: isEligible ? colors.neonTurquoise : colors.red,
                    }}
                  >
                    {isEligible && (
                      <FormattedMessage
                        defaultMessage={'Address is eligible'}
                      />
                    )}
                    {isEligible === false && (
                      <FormattedMessage
                        defaultMessage={'Address is not eligible'}
                      />
                    )}
                  </H4>
                </Box>
              </Box>
              <Input
                handleChange={handleChange}
                inputValue={inputValue}
                placeholder="Enter your address"
              />
            </Box>
            <Body sx={{ marginBottom: landingTheme.spacing(6) }}>
              <FormattedMessage
                defaultMessage={
                  'It’s the Season of Deposits and Notional is giving the gift of growth! For existing USDC depositors only: increase your deposit by at least 5,000 USDC before the end of the year and get an extra 5% APY for two weeks on the additional amount you deposited.'
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
                <FormattedMessage defaultMessage="Eligible users must increase their USDC deposits on Notional by at least 5,000 USDC on Ethereum or Arbitrum." />
              </Body>
              <Body>
                <FormattedMessage defaultMessage="Users can deposit in the form of providing liquidity or lending at a fixed or variable rate." />
              </Body>
              <Body>
                <FormattedMessage defaultMessage="Users can deposit any time between December 16th and December 31st." />
              </Body>
              <Body>
                <FormattedMessage defaultMessage="Max reward of 2,000 USDC per user." />
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
                <FormattedMessage defaultMessage="Eligibility will be determined based on a market snapshot on December 15th UTC 0. At the time of this snapshot:" />
              </Body>
              <Body>
                <FormattedMessage defaultMessage="You must hold USDC liquidity, variable lend, or fixed lend position on Ethereum and Arbitrum." />
              </Body>
              <Body>
                <FormattedMessage defaultMessage="You must not be borrowing USDC or any other stablecoin. (stablecoin leveraged liquidity users are ineligible)." />
              </Body>
              <Body>
                <FormattedMessage defaultMessage="You must not make any withdrawal for 30 days after your additional deposit." />
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
                <FormattedMessage defaultMessage="• Rewards will be distributed on February 10th." />
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
            background: colors.darkGreen,
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
                  background: colors.black,
                  color: colors.white,
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
                  background: colors.black,
                  color: colors.white,
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
    background: ${colors.black};
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

export default BoostView;
