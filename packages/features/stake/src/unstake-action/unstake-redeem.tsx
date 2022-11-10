import { useEffect } from 'react';
import { Box, styled } from '@mui/material';
import { CurrencyInput, CountdownCards, H3, InputLabel } from '@notional-finance/mui';
import { TradeActionButton } from '@notional-finance/trade';
import { useHistory } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { useUnstakeAction } from './use-unstake-action';
import { setStakedNOTEInputString } from './unstake-store';
import { RedemptionInfo } from './redemption-info';
import { messages } from '../messages';

const Section = styled(Box)`
  margin-bottom: 3rem;
  width: 100%;
`;

export const UnstakeRedeem = () => {
  const history = useHistory();
  const { canSubmit, sNoteAmountError, redeemWindowEnd, maxSNoteAmount } = useUnstakeAction();

  useEffect(() => {
    history.push('/unstake/redeem/');
  }, [history]);

  return (
    <>
      <Section sx={{ marginTop: '3rem' }}>
        <InputLabel inputLabel={messages.unstake.redeemInput} />
        <CurrencyInput
          placeholder="sNOTE to Redeem"
          decimals={18}
          maxValue={maxSNoteAmount?.toExactString()}
          onInputChange={(input) => setStakedNOTEInputString(input)}
          errorMsg={sNoteAmountError && <FormattedMessage {...sNoteAmountError} />}
          currencies={['sNOTE']}
        />
      </Section>
      <Section></Section>
      <Section>
        <TradeActionButton
          canSubmit={canSubmit}
          onSubmit={() => history.push(`/unstake/redeem-snote/?confirm=true`)}
          walletConnectedText={messages.unstake.redeemCTA}
        ></TradeActionButton>
      </Section>
      <Section>
        <H3>
          <FormattedMessage {...messages.unstake.redemptionWindow} />
          <RedemptionInfo />
        </H3>
        <CountdownCards futureDate={redeemWindowEnd} totalDaysToCountDown={3} />
      </Section>
      <Box sx={{ textAlign: 'center' }}>
        <TradeActionButton
          canSubmit={true}
          width="60%"
          buttonVariant="outlined"
          onSubmit={() => history.push(`/unstake/end-redeem/?confirm=true`)}
          walletConnectedText={messages.unstake.endRedemptionCTA}
        />
      </Box>
    </>
  );
};
