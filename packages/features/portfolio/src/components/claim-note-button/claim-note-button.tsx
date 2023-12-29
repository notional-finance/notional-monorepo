import { useCallback, useEffect, useState } from 'react';
import { Box, useTheme, styled } from '@mui/material';
import { CountUp, ButtonText } from '@notional-finance/mui';
import { NoteWithShadow, ArbitrumIcon } from '@notional-finance/icons';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import {
  useAccountDefinition,
  useAccountReady,
  useAccruedIncentives,
  useSelectedNetwork,
  useTransactionStatus,
} from '@notional-finance/notionable-hooks';
import { ClaimNOTE } from '@notional-finance/transaction';
import { TokenBalance } from '@notional-finance/core-entities';

interface ClaimNoteType {
  theme: NotionalTheme;
  hover?: boolean;
  showArbButton?: boolean;
}

const useIncentiveCountUp = (i?: {
  current: TokenBalance;
  in100Sec: TokenBalance;
}) => {
  const [c, setCountUp] = useState<number>(0);

  useEffect(() => {
    const currentFloat = i?.current.toFloat();
    const in100SecFloat = i?.in100Sec.toFloat();

    if (currentFloat) setCountUp(currentFloat);

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
  }, [i]);

  return c;
};

export const ClaimNoteButton = () => {
  const theme = useTheme();
  const isAccountReady = useAccountReady();
  const { account } = useAccountDefinition();
  const network = useSelectedNetwork();
  const { isReadOnlyAddress, onSubmit } = useTransactionStatus();
  const [hover, setHover] = useState(false);
  const accruedIncentives = useAccruedIncentives();

  const noteCountUp = useIncentiveCountUp(accruedIncentives['NOTE']);
  const arbCountUp = useIncentiveCountUp(accruedIncentives['ARB']);

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
      }}
    >
      {noteCountUp > 0 && isAccountReady && (
        <Wrapper
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={handleClick}
        >
          <ClaimNoteWrapper hover={hover} theme={theme}>
            <FormattedMessage defaultMessage={'Claim'} />{' '}
          </ClaimNoteWrapper>
          <NoteWrapper theme={theme} showArbButton={arbCountUp > 0}>
            <NoteIcon />
            <Box sx={{ paddingLeft: theme.spacing(1) }}>
              {noteCountUp > 0 ? (
                <CountUp value={noteCountUp} duration={0.1} decimals={8} />
              ) : (
                ''
              )}
            </Box>
          </NoteWrapper>
          {arbCountUp > 0 && (
            <ArbWrapper theme={theme}>
              <ArbitrumIcon />
              <Box sx={{ paddingLeft: theme.spacing(1) }}>
                {arbCountUp > 0 ? (
                  <CountUp value={arbCountUp} duration={0.1} decimals={3} />
                ) : (
                  ''
                )}
              </Box>
            </ArbWrapper>
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
  background: ${
    !hover ? theme.palette.common.white : theme.palette.primary.light
  };
`
);

const NoteWrapper = styled(ButtonText, {
  shouldForwardProp: (prop: string) => prop !== 'showArbButton',
})(
  ({ showArbButton, theme }: ClaimNoteType) => `
  display: flex;
  height: 100%;
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
const ArbWrapper = styled(ButtonText)(
  ({ theme }) => `
  display: flex;
  height: 100%;
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
`
);

export default ClaimNoteButton;
