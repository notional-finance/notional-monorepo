import { Box, useTheme } from '@mui/material';
import { Faq, FaqHeader } from '@notional-finance/mui';
import {
  useCurrentTradeContext,
  useVaultPosition,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import {
  MobileVaultSummary,
  VaultModal,
  VaultPerformanceChart,
  VaultReinvestmentHistory,
  VaultTotalRow,
} from '../components';
import { TradeActionSummary } from '@notional-finance/trade';
import { useVaultFaq } from '../hooks';
import { useParams } from 'react-router-dom';
import { APYData } from '@notional-finance/core-entities';

export const VaultSummary = () => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const { deposit } = trade?.selectedTokens ?? {};
  const vaultAddress = trade?.vaultAddress;
  const selectedNetwork = trade?.selectedNetwork;
  const vaultType = trade?.vaultType;
  const hasPoints = vaultType === 'SingleSidedLP_Points';
  const position = useVaultPosition(selectedNetwork, vaultAddress);
  const { action } = useParams<{
    action?: string;
  }>();

  const { faqHeaderLinks, faqs } = useVaultFaq(
    selectedNetwork,
    deposit?.symbol,
    hasPoints,
    vaultType,
    vaultAddress
  );

  return (
    <Box>
      {hasPoints && <VaultModal />}
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
            currentPositionAPYFactors={
              action === 'WithdrawVault' || action === 'Manage'
                ? (position?.apyData as APYData)
                : undefined
            }
          >
            <VaultPerformanceChart />
            <VaultTotalRow />
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
