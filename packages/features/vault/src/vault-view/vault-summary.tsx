import { Box, useTheme } from '@mui/material';
import { Faq, FaqHeader, DataTable, TotalRow } from '@notional-finance/mui';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { MobileVaultSummary, VaultModal } from '../components';
import { VaultActionContext } from '../vault';
import {
  LiquidationChart,
  PerformanceChart,
  TradeActionSummary,
} from '@notional-finance/trade';
import {
  useVaultReinvestmentTable,
  useVaultExistingFactors,
  useVaultFaq,
} from '../hooks';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import { useAllMarkets, useFiat } from '@notional-finance/notionable-hooks';

export const VaultSummary = () => {
  const theme = useTheme();
  const { state } = useContext(VaultActionContext);
  const baseCurrency = useFiat();
  const {
    vaultAddress,
    totalCapacityRemaining,
    selectedNetwork,
    collateral,
    deposit,
    vaultTVL,
  } = state;
  const { vaultShare, assetLiquidationPrice, priorBorrowRate, leverageRatio } =
    useVaultExistingFactors();
  const { nonLeveragedYields } = useAllMarkets(selectedNetwork);

  const nonLeveragedYield = nonLeveragedYields.find(
    (y) => y.token.id === collateral?.id
  );
  const points = nonLeveragedYield?.pointMultiples;

  const { faqHeaderLinks, faqs } = useVaultFaq(
    selectedNetwork,
    deposit?.symbol,
    points
  );

  const tvl = vaultTVL?.toFiat(baseCurrency);

  const totalsData = [
    {
      title: 'TVL',
      value: tvl?.toFloat(),
      prefix: tvl?.fiatSymbol,
      decimals: 2,
    },
    {
      title: 'Remaining Borrow Capacity',
      value: totalCapacityRemaining?.isNegative()
        ? 0
        : totalCapacityRemaining?.toFloat(),
      suffix: ` ${totalCapacityRemaining?.symbol || ''}`,
      decimals: 0,
    },
    {
      title: 'Incentives',
      value: 'Automatic Reinvest',
    },
  ];

  const { reinvestmentTableData, reinvestmentTableColumns } =
    useVaultReinvestmentTable(selectedNetwork, deposit, vaultAddress);

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
            <PerformanceChart
              state={state}
              priorVaultFactors={{
                vaultShare,
                vaultBorrowRate: priorBorrowRate,
                leverageRatio,
                isPrimeBorrow:
                  vaultShare?.maturity === PRIME_CASH_VAULT_MATURITY,
              }}
            />
            <TotalRow totalsData={totalsData} />
            <LiquidationChart
              state={state}
              vaultCollateral={vaultShare}
              vaultLiquidationPrice={assetLiquidationPrice}
            />
            <Box
              sx={{
                marginBottom: theme.spacing(5),
                marginTop: theme.spacing(5),
              }}
            >
              <DataTable
                tableTitle={
                  <FormattedMessage
                    defaultMessage={'Vault Reinvestment History'}
                  />
                }
                data={reinvestmentTableData}
                maxHeight={theme.spacing(51)}
                columns={reinvestmentTableColumns}
              />
            </Box>
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
