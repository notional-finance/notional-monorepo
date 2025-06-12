import { Box, styled, useTheme } from '@mui/material';
import { Network } from '@notional-finance/util';

import Chip from '@mui/material/Chip';
import Header from './components/header';
import InfoBox from './components/info-box';
import DataSection from './components/data-section';
import FAQSection from './components/faq-section';
import InputContainer from './components/input-container';
import { useInputContainer } from './hooks/use-input-container';
import { useDataSection } from './hooks/use-data-section';
import { useInfoBox } from './hooks/use-info-box';
import { observer } from 'mobx-react-lite';
import { FeatureLoader } from '@notional-finance/shared-web';
import { useLendFixedFaq } from '@notional-finance/lend-feature-shell/lend-fixed/hooks';

const TransactionScreen = () => {
  const theme = useTheme();
  const isReady = true;
  const network = Network.mainnet;

  const { content, inputTextRow, button } = useInputContainer();
  const tabs = useInfoBox();
  const { faqs } = useLendFixedFaq(network);
  const { title, button: dataButton, contents } = useDataSection();

  return (
    <FeatureLoader featureLoaded={isReady === true}>
      <ScreenContainer>
        <Header
          title={'Convex: crvUSD/USDC'}
          tokenSymbol={'USDC'}
          secondaryTitle={
            // TODO: list features here...
            <Chip
              label="Smart Redemption"
              color="info"
              size="small"
              sx={{
                backgroundColor: theme.palette.info.light,
                color: theme.palette.info.dark,
              }}
            />
          }
          apyInfo={{
            totalAPY: 25.4,
            organicAPY: 10,
            assetAPY: 10,
            feeAPY: 10,
            apySpread: 10,
          }}
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
  margin: ${theme.spacing(7)} auto;
  padding: 0 ${theme.spacing(2)};
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
  padding-bottom: ${theme.spacing(4)};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`
);

export default observer(TransactionScreen);
