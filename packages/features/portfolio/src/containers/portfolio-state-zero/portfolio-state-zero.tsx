import { Box, styled, useTheme } from '@mui/material';
import { Banner, H2, LabelValue, Subtitle } from '@notional-finance/mui';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import {
  PORTFOLIO_STATE_ZERO_OPTIONS,
  SETTINGS_SIDE_DRAWERS,
} from '@notional-finance/util';
import { FormattedMessage, defineMessage, defineMessages } from 'react-intl';
import connectImage from './connect-wallet.svg';
import { useEffect, useState } from 'react';
import { PortfolioNetworkSelector } from '@notional-finance/wallet';
import { NotionalTheme } from '@notional-finance/styles';
import { TokenIcon } from '@notional-finance/icons';
import { useCardData, useTokenData } from './hooks';
import {
  useAccountReady,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import StateZeroCard from './state-zero-card';
import StateZeroToggle from './state-zero-toggle';
import { useHistory, useParams } from 'react-router';

interface TokenBoxProps {
  theme: NotionalTheme;
  active: boolean;
}

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

export const PortfolioStateZero = () => {
  const theme = useTheme();
  const history = useHistory();
  const params = useParams<any>();
  const { setWalletSideDrawer } = useSideDrawerManager();
  const selectedNetwork = useSelectedNetwork();
  const isAccountReady = useAccountReady(selectedNetwork);
  const [activeToken, setActiveToken] = useState<string>('ETH');
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const { availableSymbols, activeTokenData } = useTokenData(
    selectedTabIndex,
    activeToken
  );
  const cardData = useCardData(selectedTabIndex, activeToken, activeTokenData);

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

  useEffect(() => {
    if (!availableSymbols.includes(activeToken)) {
      setActiveToken('ETH');
    }
  }, [availableSymbols, activeToken]);

  const handleToggle = (toggleNum: number) => {
    if (toggleNum === 0) {
      history.push(`/portfolio/${selectedNetwork}/welcome/earn`);
    } else if (toggleNum === 1) {
      history.push(`/portfolio/${selectedNetwork}/welcome/leverage`);
    } else if (toggleNum === 2) {
      history.push(`/portfolio/${selectedNetwork}/welcome/borrow`);
    }
  };

  return (
    <PortfolioMainContent>
      {!isAccountReady && (
        <Box sx={{ marginTop: theme.spacing(6) }}>
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
      <TokenContainer>
        <PortfolioNetworkSelector
          sx={{
            marginLeft: '0px',
            marginTop: theme.spacing(1),
            width: 'fit-content',
          }}
          hideNetWorth={true}
        />
        <Box
          sx={{
            display: 'flex',
            marginLeft: {
              sm: '0px',
              md: theme.spacing(3),
              lg: theme.spacing(3),
            },
            flexWrap: 'wrap',
          }}
        >
          {availableSymbols.map((token, index) => (
            <TokenBox
              key={index}
              theme={theme}
              onClick={() => setActiveToken(token)}
              active={activeToken === token}
            >
              <TokenIcon symbol={token} size="small" />
              <LabelValue sx={{ marginLeft: theme.spacing(1) }}>
                {token}
              </LabelValue>
            </TokenBox>
          ))}
        </Box>
      </TokenContainer>
      <Box
        sx={{
          width: '99%',
          margin: 'auto',
          marginTop: theme.spacing(4),
          gap: {
            sm: theme.spacing(6),
            md: theme.spacing(3),
            lg: theme.spacing(3),
          },
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {cardData.map((card, index) => (
          <StateZeroCard index={index} card={card} />
        ))}
      </Box>
    </PortfolioMainContent>
  );
};

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
      min-width: 100%;
      max-width: 70vw;
      margin: ${theme.spacing(10)} auto;
      margin-bottom: ${theme.spacing(20)};
    };
  `
);

const TokenBox = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ active, theme }: TokenBoxProps) => `
    display: flex;
    align-items: center;
    cursor: pointer;
    width: fit-content;
    padding: ${theme.spacing(1, 1.5)};
    border-radius: 50px;
    margin-right: ${theme.spacing(2)};
    margin-top: ${theme.spacing(1)};
    background: ${
      active ? theme.palette.info.light : theme.palette.background.paper
    };
    border: ${
      active
        ? `1px solid ${theme.palette.primary.light}`
        : theme.shape.borderStandard
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
  `
);

const TokenContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    margin-top: ${theme.spacing(8)};
    ${theme.breakpoints.down('md')} {
      flex-direction: column;
    }
    ${theme.breakpoints.down('sm')} {
      margin-top: ${theme.spacing(25)};
    }
  `
);

export default PortfolioStateZero;
