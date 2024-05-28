import { useCallback, useEffect, useState } from 'react';
import { Box, useTheme, styled } from '@mui/material';
import { CountUp, ButtonText, H4 } from '@notional-finance/mui';
import { NoteWithShadow, TokenIcon } from '@notional-finance/icons';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import {
  useAccountDefinition,
  useSelectedNetwork,
  useTotalIncentives,
  useTransactionStatus,
} from '@notional-finance/notionable-hooks';
import { ClaimNOTE } from '@notional-finance/transaction';
import {
  TokenBalance,
  SecondaryIncentiveToken,
} from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';

interface ClaimNoteType {
  theme: NotionalTheme;
  hover?: boolean;
  showArbButton?: boolean;
}

const useIncentiveCountUp = (
  i:
    | {
        current: TokenBalance;
        in100Sec: TokenBalance;
      }
    | undefined,
  network: Network
) => {
  const [c, setCountUp] = useState<number>(0);

  useEffect(() => {
    // Reset the count up on network change
    setCountUp(0);
  }, [network]);

  useEffect(() => {
    const currentFloat = i?.current.toFloat();
    const in100SecFloat = i?.in100Sec.toFloat();

    if (c === 0 && currentFloat) setCountUp(currentFloat);

    if (in100SecFloat && currentFloat) {
      const perSecondFloat = (in100SecFloat - currentFloat) / 100;
      const interval = setInterval(() => {
        if (perSecondFloat > 0) {
          setCountUp((c) => c + 0.1 * perSecondFloat);
        }
      }, 100);

      return () => clearInterval(interval);
    } else {
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  return c;
};

export const ClaimNoteButton = () => {
  const theme = useTheme();
  const network = useSelectedNetwork();
  const account = useAccountDefinition(network);
  const { isReadOnlyAddress, onSubmit } = useTransactionStatus(network);
  const [hover, setHover] = useState(false);
  const totalIncentives = useTotalIncentives(network);

  const noteCountUp = useIncentiveCountUp(totalIncentives['NOTE'], network);
  const secondaryCountUp = useIncentiveCountUp(
    totalIncentives[SecondaryIncentiveToken[network]],
    network
  );

  const handleClick = useCallback(async () => {
    if (isReadOnlyAddress || !account || !network) return;

    const txn = ClaimNOTE({
      address: account.address,
      network,
      redeemToWETH: false,
      accountBalances: [],
      maxWithdraw: false,
    });
    onSubmit('ClaimNOTE', await txn);
  }, [onSubmit, isReadOnlyAddress, account, network]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'end',
        flexDirection: 'column',
      }}
    >
      {(noteCountUp > 0 || secondaryCountUp > 0) && account && (
        <ClaimLabel>
          <FormattedMessage defaultMessage={'Claim'} />
        </ClaimLabel>
      )}
      {(noteCountUp > 0 || secondaryCountUp > 0) && account && (
        <Wrapper
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={handleClick}
        >
          <ClaimNoteWrapper hover={hover} theme={theme}>
            <FormattedMessage defaultMessage={'Claim'} />
          </ClaimNoteWrapper>
          {noteCountUp > 0 && (
            <NoteWrapper theme={theme} showArbButton={secondaryCountUp > 0}>
              <NoteIcon />
              <Box sx={{ paddingLeft: theme.spacing(1) }}>
                {noteCountUp > 0 ? (
                  <CountUp value={noteCountUp} duration={0.1} decimals={8} />
                ) : (
                  ''
                )}
              </Box>
            </NoteWrapper>
          )}
          {secondaryCountUp > 0 && (
            <SecondaryWrapper theme={theme}>
              <TokenIcon symbol="GHO" size={'medium'} />
              <Box sx={{ paddingLeft: theme.spacing(1) }}>
                {secondaryCountUp > 0 ? (
                  <CountUp
                    value={secondaryCountUp}
                    duration={0.1}
                    decimals={8}
                  />
                ) : (
                  ''
                )}
              </Box>
            </SecondaryWrapper>
          )}
        </Wrapper>
      )}
    </Box>
  );
};

const NoteIcon = styled(NoteWithShadow)(
  ({ theme }) => `
  height: ${theme.spacing(4)};
  width: ${theme.spacing(4)};
`
);

const ClaimNoteWrapper = styled(ButtonText, {
  shouldForwardProp: (prop: string) => prop !== 'hover',
})(
  ({ hover, theme }: ClaimNoteType) => `
  color: ${!hover ? theme.palette.primary.light : theme.palette.common.white};
  border-radius: 6px 0px 0px 6px;
  border: 1px solid ${theme.palette.primary.light};
  padding: ${theme.spacing(0, 3, 0, 3)};
  height: 100%;
  display: flex;
  align-items: center;
  white-space: nowrap;
  transition: all .3s ease-in-out;
  min-height: ${theme.spacing(5)};
  background: ${
    !hover ? theme.palette.common.white : theme.palette.primary.light
  };
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
`
);

const ClaimLabel = styled(H4)(
  ({ theme }) => `
  display: block;
  margin-bottom: ${theme.spacing(1)};
  ${theme.breakpoints.up('sm')} {
    display: none;
  }
`
);

const NoteWrapper = styled(ButtonText, {
  shouldForwardProp: (prop: string) => prop !== 'showArbButton',
})(
  ({ showArbButton, theme }: ClaimNoteType) => `
  display: flex;
  height: 100%;
  min-height: ${theme.spacing(5)};
  align-items: center;
  border: 1px solid ${theme.palette.primary.light};
  padding: ${theme.spacing(0, 2, 0, 1)};
  border-radius: ${showArbButton ? '0px 0px 0px 0px' : '0px 6px 6px 0px'};
  border-right: ${
    showArbButton ? `1px solid ${theme.palette.common.white}` : 'none'
  };
  color: ${theme.palette.common.white};
  background: ${theme.palette.primary.light};
`
);
const SecondaryWrapper = styled(ButtonText)(
  ({ theme }) => `
  display: flex;
  height: 100%;
  min-height: ${theme.spacing(5)};
  align-items: center;
  border: 1px solid ${theme.palette.primary.light};
  padding: ${theme.spacing(0, 2, 0, 1)};
  border-radius: 0px 6px 6px 0px;
  color: ${theme.palette.common.white};
  background: ${theme.palette.primary.light};
`
);

const Wrapper = styled('div')(
  ({ theme }) => `
  height: ${theme.spacing(5)};
  margin-left: ${theme.spacing(3)};
  border-radius: ${theme.shape.borderRadius()};
  display: flex;
  border: none;
  cursor: pointer;
  &:hover {
    box-shadow: ${theme.shape.shadowStandard}
  }
  ${theme.breakpoints.down('sm')} {
    margin-left: 0px;
    gap: ${theme.spacing(1)};
    span {
      border-radius: ${theme.shape.borderRadius()} !important;      
    }
  }
`
);

export default ClaimNoteButton;
