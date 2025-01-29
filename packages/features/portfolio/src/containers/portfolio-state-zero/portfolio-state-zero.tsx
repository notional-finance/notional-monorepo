import { Box, styled, useTheme } from '@mui/material';
import { Banner, H2, Subtitle } from '@notional-finance/mui';
import { useSideDrawerManager } from '@notional-finance/notionable-hooks';
import {
  PORTFOLIO_STATE_ZERO_OPTIONS,
  SETTINGS_SIDE_DRAWERS,
} from '@notional-finance/util';
import { FormattedMessage, defineMessage, defineMessages } from 'react-intl';
import connectImage from './connect-wallet.svg';
import { useEffect, useState } from 'react';
import {
  PortfolioParams,
  useAccountReady,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import StateZeroToggle from './state-zero-toggle';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useNetworkTokenData } from './hooks/use-network-token-data';
import StateZeroData from './state-zero-data';
import { useMobileWelcomeNav } from './hooks';
import { BottomMobileNav } from '@notional-finance/shared-web';

const stateZeroBanner = {
  title: defineMessage({
    defaultMessage: 'Please, connect your wallet',
    description: 'empty note staking overview title',
  }),
  messages: defineMessages({
    promptText: {
      defaultMessage:
        'Connect your wallet to see your portfolio or personalized recommendations.',
      description: 'empty note staking overview prompt text',
    },
    buttonText: {
      defaultMessage: 'Connect Wallet',
      description: 'empty note staking button text',
    },
  }),
};

const PortfolioStateZero = observer(() => {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams<{ sideDrawerKey?: string }>();
  const { setWalletSideDrawer } = useSideDrawerManager();
  const selectedNetwork = useSelectedNetwork();
  const isAccountReady = useAccountReady(selectedNetwork);
  const { sideDrawerKey } = useParams<PortfolioParams>();
  const options = useMobileWelcomeNav();
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const { tokenList, defaultSymbol } = useNetworkTokenData(selectedTabIndex);

  useEffect(() => {
    if (
      params?.sideDrawerKey === 'earn' &&
      selectedTabIndex !== PORTFOLIO_STATE_ZERO_OPTIONS.EARN
    ) {
      setSelectedTabIndex(PORTFOLIO_STATE_ZERO_OPTIONS.EARN);
    } else if (
      params?.sideDrawerKey === 'leverage' &&
      selectedTabIndex !== PORTFOLIO_STATE_ZERO_OPTIONS.LEVERAGE
    ) {
      setSelectedTabIndex(PORTFOLIO_STATE_ZERO_OPTIONS.LEVERAGE);
    } else if (
      params?.sideDrawerKey === 'borrow' &&
      selectedTabIndex !== PORTFOLIO_STATE_ZERO_OPTIONS.BORROW
    ) {
      setSelectedTabIndex(PORTFOLIO_STATE_ZERO_OPTIONS.BORROW);
    }
  }, [selectedTabIndex, params?.sideDrawerKey]);

  const handleToggle = (toggleNum: number) => {
    if (toggleNum === 0) {
      navigate(`/portfolio/${selectedNetwork}/welcome/earn`);
    } else if (toggleNum === 1) {
      navigate(`/portfolio/${selectedNetwork}/welcome/leverage`);
    } else if (toggleNum === 2) {
      navigate(`/portfolio/${selectedNetwork}/welcome/borrow`);
    }
  };

  return (
    <PortfolioMainContent>
      {!isAccountReady && (
        <Box
          sx={{
            marginTop: theme.spacing(6),
            [theme.breakpoints.down('sm')]: {
              display: 'none',
            },
          }}
        >
          <Banner
            messages={stateZeroBanner.messages}
            buttonSuffix={``}
            title={stateZeroBanner.title}
            imgSrc={connectImage}
            callback={() =>
              setWalletSideDrawer(SETTINGS_SIDE_DRAWERS.CONNECT_WALLET)
            }
          />
        </Box>
      )}
      <TopContentContainer>
        <Box sx={{ marginTop: theme.spacing(6) }}>
          <Box sx={{ display: 'flex' }}>
            <H2 sx={{ marginRight: theme.spacing(1) }}>
              <FormattedMessage defaultMessage={'Welcome'} />
            </H2>
            <span role="img" aria-label="wave" style={{ fontSize: '32px' }}>
              👋
            </span>
          </Box>

          <Subtitle sx={{ color: theme.palette.typography.light }}>
            {selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.EARN && (
              <FormattedMessage
                defaultMessage={'Earn products offer passive, easy yield.'}
              />
            )}
            {selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.LEVERAGE && (
              <FormattedMessage
                defaultMessage={
                  'Leveraged products offer maximum returns for advanced DeFi users.'
                }
              />
            )}
            {selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.BORROW && (
              <FormattedMessage
                defaultMessage={
                  'Earn yield on your collateral while you borrow against it at a fixed or variable rate.'
                }
              />
            )}
          </Subtitle>
        </Box>
        <StateZeroToggle
          selectedTabIndex={selectedTabIndex}
          handleToggle={handleToggle}
        />
      </TopContentContainer>
      <StateZeroData
        defaultSymbol={defaultSymbol || ''}
        tokenList={tokenList || []}
        selectedTabIndex={selectedTabIndex}
      />
      <BottomMobileNav options={options} navKey={sideDrawerKey} />
    </PortfolioMainContent>
  );
});

const PortfolioMainContent = styled(Box)(
  ({ theme }) => `
    flex: 1;
    display: flex;
    flex-flow: column;
    margin: ${theme.spacing(14, 8)};
    margin-top: ${theme.spacing(3)};
    min-height: ${theme.spacing(140)};
    overflow: hidden;
    @media (max-width: 600px) {
    }
    ${theme.breakpoints.up('xxl')} {
      max-width: ${theme.spacing(161)};
      margin: ${theme.spacing(14)} auto;
      margin-top: ${theme.spacing(3)};
    }
    ${theme.breakpoints.down('lg')} {
      margin: ${theme.spacing(14, 5)};
      margin-top: ${theme.spacing(3)};
    }
    ${theme.breakpoints.down('sm')} {
      min-height: 0px;
      min-width: 100%;
      max-width: 70vw;
      margin: ${theme.spacing(3)} auto ${theme.spacing(3)};
    };
  `
);

const TopContentContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-Content: space-between;
    align-items: end;
    ${theme.breakpoints.down('md')} {
      flex-direction: column;
      align-items: baseline;
      height: ${theme.spacing(25)};
    }
    ${theme.breakpoints.down('sm')} {
      display: none;
    }
  `
);

export default PortfolioStateZero;
