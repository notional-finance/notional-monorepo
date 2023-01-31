import { useEffect, useState } from 'react';
import { Box, useTheme, styled } from '@mui/material';
import { CountUp, ButtonText } from '@notional-finance/mui';
import { useAccount } from '@notional-finance/notionable-hooks';
import { NoteWithShadow } from '@notional-finance/icons';
import { useNotional } from '@notional-finance/notionable-hooks';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { UserNoteData } from '../../hooks';

interface ClaimNoteType {
  theme: NotionalTheme;
  hover?: boolean;
}

interface ClaimNoteButtonProps {
  claimNoteData: UserNoteData;
}

export const ClaimNoteButton = ({ claimNoteData }: ClaimNoteButtonProps) => {
  const theme = useTheme();
  const { notional } = useNotional();
  const { account, accountSummariesLoaded } = useAccount();
  const [noteCountUp, setNoteCountUp] = useState<number>(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (claimNoteData.userNoteEarnedFloat) {
      setNoteCountUp(claimNoteData.userNoteEarnedFloat);
    }
  }, [claimNoteData.userNoteEarnedFloat]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (claimNoteData.userNoteEarnedPerSecond > 0) {
        setNoteCountUp(
          (noteCountUp) =>
            noteCountUp + 0.1 * claimNoteData.userNoteEarnedPerSecond
        );
      }
    }, 100);
    return () => clearInterval(interval);
  }, [claimNoteData.userNoteEarnedPerSecond]);

  const handleClick = async () => {
    if (account?.address && notional) {
      const unsignedTxn = await notional.claimIncentives(account.address);
      await account.sendTransaction(unsignedTxn);
    }
  };

  // NOTE: accountSummariesLoaded is used here to ensure that the button is rendered on time with the button-bar
  return (
    <Box>
      {!claimNoteData?.userNoteEarned.isZero() && accountSummariesLoaded && (
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
                <CountUp value={noteCountUp} duration={0.1} decimals={3} />
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
