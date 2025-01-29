import { useTheme, Box, styled } from '@mui/material';
import { useCardData, useMoreDropdown } from './hooks';
import { useEffect, useState } from 'react';
import { PortfolioNetworkSelector } from '@notional-finance/wallet';
import { TokenIcon } from '@notional-finance/icons';
import { LabelValue, SimpleDropdown } from '@notional-finance/mui';
import { NotionalTheme } from '@notional-finance/styles';
import StateZeroCard from './state-zero-card';
import { observer } from 'mobx-react-lite';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { MobileCurrencySelector } from '@notional-finance/wallet';

interface TokenBoxProps {
  theme: NotionalTheme;
  active: boolean;
}

const StateZeroData = observer(
  ({
    defaultSymbol,
    tokenList,
    selectedTabIndex,
  }: {
    defaultSymbol: string;
    tokenList: string[];
    selectedTabIndex: number;
  }) => {
    const theme = useTheme();
    const { isMobileView } = useAppStore();
    const [activeToken, setActiveToken] = useState<string>(defaultSymbol);

    const { options, title, displaySymbols } = useMoreDropdown(
      tokenList,
      setActiveToken
    );

    useEffect(() => {
      if (!tokenList.includes(activeToken)) {
        setActiveToken(defaultSymbol);
      }
    }, [tokenList, activeToken, defaultSymbol]);

    const cardData = useCardData(selectedTabIndex, activeToken);

    return (
      <>
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
              alignItems: 'end',
              marginLeft: {
                sm: '0px',
                md: theme.spacing(3),
                lg: theme.spacing(3),
              },
              flexWrap: 'wrap',
              paddingX: theme.spacing(2),
            }}
          >
            {displaySymbols.map((token, index) => (
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
            {options && options.length > 0 && !isMobileView ? (
              <SimpleDropdown
                options={options}
                title={title}
                altDropdownArrow={true}
                sx={{ marginTop: theme.spacing(1) }}
                innerWrapperSx={{ width: '200px', fontSize: '14px' }}
              />
            ) : (
              <MobileCurrencySelector
                options={options}
                title={title}
                sx={{ marginTop: theme.spacing(1) }}
                activeToken={activeToken}
              />
            )}
          </Box>
        </TokenContainer>
        <Box
          sx={{
            width: '99%',
            margin: 'auto',
            marginTop: theme.spacing(4),
            gap: {
              sm: theme.spacing(6),
              md: theme.spacing(6, 3),
              lg: theme.spacing(6, 3),
            },
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          {cardData.map((card, index) => (
            <StateZeroCard index={index} card={card} key={index} />
          ))}
        </Box>
      </>
    );
  }
);

export default StateZeroData;

const TokenBox = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ active, theme }: TokenBoxProps) => `
      height: ${theme.spacing(5.25)};
      display: flex;
      align-items: center;
      cursor: pointer;
      width: fit-content;
      padding: ${theme.spacing(1, 1.5)};
      border-radius: 50px;
      margin-right: ${theme.spacing(2)};
      margin-top: ${theme.spacing(1)};
      
      transition: all 0.3s;
      background: ${
        active ? theme.palette.info.light : theme.palette.background.paper
      };
      border: ${
        active
          ? `1px solid ${theme.palette.primary.light}`
          : theme.shape.borderStandard
      };
      &:hover {
        background: ${theme.palette.info.light};
        border: 1px solid ${theme.palette.primary.light};
      }
    `
);

const TokenContainer = styled(Box)(
  ({ theme }) => `
      display: flex;
      margin-top: ${theme.spacing(8)};
  
      #basic-button {
        height: ${theme.spacing(5.25)};
        border: ${theme.shape.borderStandard};
        background: ${theme.palette.background.paper};
        color: ${theme.palette.typography.main};
        padding: ${theme.spacing(1, 1.5)};
        border-radius: 50px;
        h6 {
          font-size: 14px;
          color: ${theme.palette.typography.main};
          font-weight: 600;
        }
      }
  
      ${theme.breakpoints.down('md')} {
        flex-direction: column;
      }
      ${theme.breakpoints.down('sm')} {
        margin-top: 0px;
      }
    `
);
