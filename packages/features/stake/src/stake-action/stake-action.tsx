import { useParams } from 'react-router-dom';
import { Box, styled } from '@mui/material';
import {
  TokenApprovalView,
  TradeActionButton,
} from '@notional-finance/trade';
import { useStakeAction } from './use-stake-action';
import { updateStakeState } from './stake-store';
import { useEffect, useRef } from 'react';
import { StakedNoteInfoBox } from './staked-note-info-box';
import {
  CurrencyInputHandle,
} from '@notional-finance/mui';

const Section = styled(Box)`
  margin-bottom: 32px;
  width: 100%;
`;

export const StakeAction = () => {
  const inputRef = useRef<CurrencyInputHandle>(null);
  const { ethOrWeth: ethOrWethParam } = useParams<Record<string, string>>();
  const {
    ethAmountString,
    ethOrWeth,
    priceImpact,
    canSubmit,
    noteSpotPriceUSD,
  } = useStakeAction();

  useEffect(() => {
    if (ethOrWethParam && ethOrWethParam !== ethOrWeth)
      updateStakeState({ ethOrWethSelected: ethOrWethParam });
  }, [ethOrWethParam, ethOrWeth]);

  useEffect(() => {
    if (ethAmountString) inputRef.current?.setInputOverride(ethAmountString);
  }, [inputRef, ethAmountString]);

  return (
    <Box>
      <Section>
        {/* <WalletDepositInput
          ref={noteInputRef}
          inputRef={noteInputRef}
          availableTokens={['NOTE']}
          selectedToken={'NOTE'}
          onChange={({ inputAmount: _inputAmount, hasError }) => {
            throw Error('Unimplemented');
            updateStakeState({
              noteAmount: undefined,
              noteHasError: hasError,
            });
          }}
          errorMsgOverride={noteError}
          inputLabel={messages.stake.inputNOTE}
        /> */}
      </Section>
      <Section>
        {/* <WalletDepositInput
          inputRef={inputRef}
          availableTokens={['ETH', 'WETH']}
          selectedToken={ethOrWeth}
          ref={inputRef}
          inputLabel={messages.stake.inputETH}
          onChange={({ selectedToken, inputAmount, hasError }) => {
            if (selectedToken !== ethOrWeth) {
              history.push(`/stake/${selectedToken}`);
            }
            throw Error('Unimplemented');

            updateStakeState({
              ethOrWethSelected: selectedToken || undefined,
              ethInputAmount: undefined,
              ethHasError: hasError,
              useOptimumETH: inputAmount !== undefined,
            });
          }}
        /> */}
      </Section>
      <Section>
        <StakedNoteInfoBox
          optimizeAction={() => {
            updateStakeState({ useOptimumETH: true });
          }}
          noteSpotPriceUSD={noteSpotPriceUSD || 0}
          noteModifiedPriceUSD={priceImpact?.noteModifiedPriceUSD}
        />
      </Section>
      <TokenApprovalView symbol={'NOTE'} />
      {ethOrWeth === 'WETH' && <TokenApprovalView symbol={'WETH'} />}
      <Section>
        <TradeActionButton canSubmit={canSubmit} />
      </Section>
    </Box>
  );
};
