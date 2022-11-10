import { useEffect } from 'react';
import { Box, styled } from '@mui/material';
import { TradeActionButton } from '@notional-finance/trade';
import { useHistory, useParams } from 'react-router-dom';
import { RedemptionInfo } from './redemption-info';
import { useUnstakeAction } from './use-unstake-action';
import { messages } from '../messages';

const Section = styled(Box)`
  margin-bottom: 32px;
  width: 100%;
`;

export const UnstakeStart = () => {
  const history = useHistory();
  const { maxSNoteAmount } = useUnstakeAction();
  const { unstakePath } = useParams<Record<string, string>>();

  useEffect(() => {
    if (history && unstakePath === '') {
      history.push('/unstake/start');
    }
  }, [history, unstakePath]);

  return (
    <>
      <Section>
        <RedemptionInfo />
      </Section>
      <Section>
        <TradeActionButton
          canSubmit={!!maxSNoteAmount}
          onSubmit={() => history.push(`/unstake/start-cooldown?confirm=true`)}
          walletConnectedText={messages.unstake.unstakeCTA}
        />
      </Section>
    </>
  );
};
