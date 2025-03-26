import { Box, styled } from '@mui/material';
import { PortfolioNetworkSelector } from '@notional-finance/wallet';
import { CountUp, H3, H5 } from '@notional-finance/mui';
import {
  useAccountReady,
  useAppStore,
  useTradeContext,
} from '@notional-finance/notionable-hooks';

import Header from './components/header';
import InfoBox from './components/info-box';
import DataSection from './components/data-section';
import FAQSection from './components/faq-section';
import InputContainer from './components/input-container';
import { useInputContainer } from './hooks/use-input-container';
import { useDataSection } from './hooks/use-data-section';
import { useInfoBox } from './hooks/use-info-box';
import { useFAQs } from './hooks/use-faqs';
import { observer } from 'mobx-react-lite';
import { FeatureLoader } from '@notional-finance/shared-web';

const TransactionScreen = () => {
  const context = useTradeContext('LendFixed');
  const isReady = context.tradeModel?.isReady;
  const network = context.tradeModel?.selectedNetwork;
  const isAccountReady = useAccountReady(network);
  const { isMobileView } = useAppStore();
  const { content, inputTextRow, button } = useInputContainer();
  const tabs = useInfoBox();
  const faqs = useFAQs();
  const { title, button: dataButton, contents } = useDataSection();

  if (!isAccountReady) {
    return null;
  }

  console.log(
    'context.tradeModel',
    JSON.parse(JSON.stringify(context.tradeModel))
  );

  return (
    <FeatureLoader featureLoaded={isReady === true}>
      <ScreenContainer>
        <Header
          title={
            (context.tradeModel?.tradeType.includes('Lend')
              ? 'Lend '
              : 'Borrow ') + context.tradeModel?.selectedDepositToken
          }
          tokenSymbol={context.tradeModel?.selectedDepositToken || ''}
          rightComponent={<PortfolioNetworkSelector />}
          middleComponent={
            <MiddleSection>
              <H3>
                <CountUp
                  value={context.tradeModel?.getAPYFactors()?.totalAPY}
                  decimals={2}
                  duration={1}
                  suffix="%"
                />{' '}
              </H3>
              {isMobileView ? <H5>APY</H5> : <H3>APY</H3>}
            </MiddleSection>
          }
        />
        <ContentContainer>
          <TopSection>
            <InputContainer infoTextRow={inputTextRow} button={button}>
              {content}
            </InputContainer>
            <InfoBox tabs={tabs} />
          </TopSection>
          <DataSection title={title} button={dataButton} contents={contents} />
          <FAQSection items={faqs} />
        </ContentContainer>
      </ScreenContainer>
    </FeatureLoader>
  );
};

// Styled Components
const ScreenContainer = styled(Box)(
  ({ theme }) => `
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing(2)};
`
);

const ContentContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
`
);

const TopSection = styled(Box)(
  ({ theme }) => `
  display: flex;
  gap: ${theme.spacing(3)};
  max-height: 50vh;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`
);

const MiddleSection = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: ${theme.spacing(1)};
  color: ${theme.palette.typography.main};

  ${theme.breakpoints.down('sm')} {
    flex-direction: column-reverse;
    align-items: flex-end;
    gap: 0;
  }
`
);

export default observer(TransactionScreen);
