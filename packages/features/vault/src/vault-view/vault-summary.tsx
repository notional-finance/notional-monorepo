import { Box, useTheme } from '@mui/material';
import { Faq, FaqHeader } from '@notional-finance/mui';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  MobileVaultSummary,
  VaultModal,
  VaultPerformanceChart,
  VaultReinvestmentHistory,
  VaultTotalRow,
} from '../components';
import { VaultActionContext } from '../vault';
import { LiquidationChart, TradeActionSummary } from '@notional-finance/trade';
import { useVaultExistingFactors, useVaultFaq } from '../hooks';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { getVaultType } from '@notional-finance/core-entities';
import { REINVESTMENT_TYPE } from '@notional-finance/util';

export const VaultSummary = () => {
  const theme = useTheme();
  const { state } = useContext(VaultActionContext);
  const { selectedNetwork, collateral, deposit, vaultAddress } = state;
  const { vaultShare, assetLiquidationPrice, priorBorrowRate, leverageRatio } =
    useVaultExistingFactors();
  const vaultType =
    vaultAddress && selectedNetwork
      ? getVaultType(vaultAddress, selectedNetwork)
      : undefined;
  const { nonLeveragedYields } = useAllMarkets(selectedNetwork);
  const currentVaultType =
    vaultType === REINVESTMENT_TYPE.PENDLE_PT
      ? REINVESTMENT_TYPE.PENDLE_PT
      : vaultType?.includes(REINVESTMENT_TYPE.DIRECT_CLAIM)
      ? REINVESTMENT_TYPE.DIRECT_CLAIM
      : REINVESTMENT_TYPE.AUTO_REINVEST;

  const nonLeveragedYield = nonLeveragedYields.find(
    (y) => y.token.id === collateral?.id
  );
  const points = nonLeveragedYield?.pointMultiples;

  const { faqHeaderLinks, faqs } = useVaultFaq(
    selectedNetwork,
    deposit?.symbol,
    points,
    currentVaultType
  );

  return (
    <Box>
      {points && <VaultModal />}
      <Box
        sx={{
          zIndex: 10,
          position: 'fixed',
          maxWidth: '100vw',
          display: {
            xs: 'block',
            sm: 'block',
            md: 'none',
          },
        }}
      >
        <MobileVaultSummary />
      </Box>
      <Box
        sx={{
          display: {
            xs: 'none',
            sm: 'none',
            md: 'block',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <TradeActionSummary
            state={state}
            priorVaultFactors={{
              vaultShare,
              vaultBorrowRate: priorBorrowRate,
              leverageRatio,
            }}
          >
            <VaultPerformanceChart />
            <VaultTotalRow />
            <LiquidationChart
              state={state}
              vaultCollateral={vaultShare}
              vaultLiquidationPrice={assetLiquidationPrice}
            />
            <VaultReinvestmentHistory />
            <FaqHeader
              title={
                <FormattedMessage defaultMessage={'Leveraged Vault FAQ'} />
              }
              links={faqHeaderLinks}
            />
            {faqs.map(
              (
                { question, answer, componentAnswer, questionDescription },
                index
              ) => (
                <Faq
                  key={index}
                  question={question}
                  answer={answer}
                  componentAnswer={componentAnswer}
                  questionDescription={questionDescription}
                  sx={{
                    marginBottom: theme.spacing(2),
                    boxShadow: theme.shape.shadowStandard,
                  }}
                />
              )
            )}
          </TradeActionSummary>
        </Box>
      </Box>
    </Box>
  );
};

export default VaultSummary;
