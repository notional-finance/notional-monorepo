import { useCallback, useEffect, useState } from 'react';
import { Box, useTheme, styled } from '@mui/material';
import { CountUp, ButtonText } from '@notional-finance/mui';
import { NoteWithShadow } from '@notional-finance/icons';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import {
  useAccountDefinition,
  useAccountReady,
  useSelectedNetwork,
  useTransactionStatus,
} from '@notional-finance/notionable-hooks';
import { ClaimNOTE } from '@notional-finance/transaction';

interface ClaimNoteType {
  theme: NotionalTheme;
  hover?: boolean;
}

export const ClaimNoteButton = () => {
  const theme = useTheme();
  const isAccountReady = useAccountReady();
  const { account } = useAccountDefinition();
  const network = useSelectedNetwork();
  const [noteCountUp, setNoteCountUp] = useState<number>(0);
  const { isReadOnlyAddress, onSubmit } = useTransactionStatus();
  const [hover, setHover] = useState(false);
  const noteClaim = account?.noteClaim;
  const currentNOTEFloat = account?.noteClaim?.currentNOTE.toFloat();
  const notePerSecondFloat = account?.noteClaim?.noteAccruedPerSecond.toFloat();

  useEffect(() => {
    if (currentNOTEFloat) setNoteCountUp(currentNOTEFloat);

    if (notePerSecondFloat) {
      const interval = setInterval(() => {
        if (notePerSecondFloat > 0) {
          setNoteCountUp(
            (noteCountUp) => noteCountUp + 0.1 * notePerSecondFloat
          );
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return undefined;
  }, [currentNOTEFloat, notePerSecondFloat]);

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
      {!!noteClaim && isAccountReady && (
        <Wrapper
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={handleClick}
        >
          <ClaimNoteWrapper hover={hover} theme={theme}>
            <FormattedMessage defaultMessage={'Claim NOTE'} />{' '}
          </ClaimNoteWrapper>
          <NoteWrapper theme={theme}>
            <NoteIcon />
            <Box sx={{ paddingLeft: theme.spacing(1) }}>
              {noteCountUp > 0 ? (
                <CountUp value={noteCountUp} duration={0.1} decimals={8} />
              ) : (
                ''
              )}
            </Box>
          </NoteWrapper>
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

const NoteWrapper = styled(ButtonText)(
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
