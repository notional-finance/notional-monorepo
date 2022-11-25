import { useState } from 'react';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { LEND_BORROW } from '@notional-finance/shared-config';
import {
  CardContainer,
  CardVariant,
  HeadingSubtitle,
} from '@notional-finance/mui';
import { Tabs as MuiTabs, Tab, styled, Box, useTheme } from '@mui/material';
import CompoundSVG from '@notional-finance/assets/images/logos/logo-compound.svg';
import { defineMessages, FormattedMessage } from 'react-intl';

const TokenTab = 0;
const cTokenTab = 1;

const CTokenTab = styled(Tab)(({ theme }) => ({
  '&.MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1.125rem',
    minWidth: '140px',
    borderRadius: ' 50px',
    opacity: 1,
  },
  '&.Mui-selected': {
    background: theme.palette.common.white,
    color: theme.palette.common.black,
  },
}));

const CTokenBox = styled(Box)(
  ({ theme }) => `
  border-radius: 68px;
  width: 980px;
  height: 90px;
  margin-top: 120px;
  margin-bottom: 90px;
  margin-right: auto;
  margin-left: auto;
  background: ${theme.palette.background.default};
  border: 1px solid #FFFFFF;
  box-shadow: 0px 4px 10px 0px #142A4A12;

  @media(max-width: 1025px) {
    width: unset;
    height: unset;
    padding-top: 5px;
    padding-right: 5px;
    padding-left: 5px;
    padding-bottom: 10px;
  }
`
);

const CTokenContainer = styled(Box)`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 1025px) {
    flex-direction: column;
    width: 100%;
  }
`;

const CTokenLeft = styled('span')`
  display: inherit;
  align-items: center;
  margin-left: 12px;
  margin-top: 16px;
`;

const CTokenRight = styled('span')`
  margin-left: 116px;
  margin-top: 16px;

  @media (max-width: 1025px) {
    margin-left: 0px;
  }
`;

const StyledMuiTabs = styled(MuiTabs)(
  ({ theme }) => `
  background: ${theme.palette.common.black};
  border: 1px solid #1C4E5C;
  border-radius: 50px;
  max-width: 290px;
  margin-left: auto;
  margin-right: auto;

  .tab-group-root {
    padding: 4px;
  }

  .tabs-indicator {
    background: none;
  }

  .tab-root {
    min-width: 140px;
    border-radius: 50px;
    opacity: 1;
    color: ${theme.palette.common.white};
    text-transform: none;
    font-weight: 600;
    font-size: 1.125rem;
  }

  .Mui-selected {
    background: ${theme.palette.common.white};
    color: ${theme.palette.common.black};
  }
`
);

export function LendCardView() {
  const theme = useTheme();
  const [tabSelected, setTabSelected] = useState(TokenTab);
  const { rates, unwrappedCurrencies, cTokens } = useAllMarkets();

  // Pure webkit does not render the text gradient properly
  const isWebKit =
    navigator.userAgent.indexOf('AppleWebKit') !== -1 &&
    navigator.userAgent.indexOf('Chrome') === -1;

  const selectTab = (tab: number) => {
    return () => {
      setTabSelected(tab);
    };
  };

  const handleTabChange = (_: any, newValue: number) => {
    setTabSelected(newValue);
  };

  const getTabSelector = () => {
    return (
      <StyledMuiTabs
        value={tabSelected}
        onChange={handleTabChange}
        aria-label="tabs"
        classes={{
          root: 'tab-group-root',
          indicator: 'tabs-indicator',
        }}
        sx={{}}
      >
        <Tab
          label="Tokens"
          classes={{
            root: 'tab-root tab-unwrapped',
          }}
          onMouseEnter={selectTab(TokenTab)}
        />
        <CTokenTab
          label="cTokens"
          onMouseEnter={selectTab(cTokenTab)}
          sx={{
            backgroundImage: isWebKit
              ? 'unset'
              : `linear-gradient(101.36deg, #27D3A2 12.05%, #9388FD 86.28%)`,
            backgroundSize: isWebKit ? 'unset' : '100%',
            backgroundClip: isWebKit ? 'unset' : 'text',
            color: isWebKit ? theme.palette.common.white : 'transparent',
            webkitBackgroundClip: isWebKit ? 'unset' : 'text',
            mozBackgroundClip: isWebKit ? 'unset' : 'text',
            webkitTextFillColor: isWebKit ? 'unset' : 'transparent',
            mozTextFillColor: isWebKit ? 'unset' : 'transparent',
          }}
        />
      </StyledMuiTabs>
    );
  };

  const cards = (tabSelected === TokenTab ? unwrappedCurrencies : cTokens).map(
    (s, i) => {
      const rate = rates.length > i ? rates[i] : 0;
      const route = `/${LEND_BORROW.LEND}/${s}`;

      return (
        <CardVariant
          variant={'currency'}
          symbol={s}
          rate={rate}
          route={route}
          buttonText={
            <FormattedMessage
              defaultMessage="Lend {symbol}"
              values={{
                symbol: s,
              }}
            />
          }
        />
      );
    }
  );

  const heading = defineMessages({
    fixed: {
      defaultMessage: 'Lend Crypto at Fixed Rates',
      description: 'page heading',
    },
    variable: {
      defaultMessage: 'Fix Your Variable Rate',
      description: 'page heading',
    },
  });
  const subtitle = defineMessages({
    fixed: {
      defaultMessage:
        'Build a stable portfolio with fixed rate income on your assets. Lock in your yield for up to one year or exit early without penalty at the market rate.',
      description: 'page subtitle',
    },
    variable: {
      defaultMessage:
        'Use your cTokens directly on Notional to swap your variable rate loan to a fixed rate and lock in your returns.',
      description: 'page subtitle',
    },
  });
  return (
    <Box>
      <CardContainer
        heading={tabSelected === TokenTab ? heading.fixed : heading.variable}
        subtitle={tabSelected === TokenTab ? subtitle.fixed : subtitle.variable}
        cards={cards}
        videoId={'uIuVLZEVRyM'}
      />
      <CTokenBox>
        <CTokenContainer>
          <CTokenLeft>
            <img
              width="54px"
              id="compound-logo"
              src={CompoundSVG}
              alt="Compound Logo"
            />
            <HeadingSubtitle
              sx={{
                marginLeft: theme.spacing(4),
                color: theme.palette.typography.light,
              }}
            >
              <FormattedMessage defaultMessage="Already have cTokens? Get fixed rates on your Compound loan." />
            </HeadingSubtitle>
          </CTokenLeft>
          <CTokenRight className="ctoken-box-right">
            {getTabSelector()}
          </CTokenRight>
        </CTokenContainer>
      </CTokenBox>
    </Box>
  );
}

export default LendCardView;
