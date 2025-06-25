import { useState, ReactNode } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { SimpleToggle, TradeSummaryBox, Body } from '@notional-finance/mui';
import { observer } from 'mobx-react-lite';
import { FeatureLoader } from '@notional-finance/shared-web';
import { FormattedMessage } from 'react-intl';

import Chip from '@mui/material/Chip';
import Header from './components/header';
import InfoBox from './components/info-box';
import DataSection from './components/data-section';
import InputContainer from './components/input-container';
import { useInfoBox } from './hooks/use-info-box';
import {
  useCurrentTradeContext,
  useVaultMetadata,
} from '@notional-finance/notionable-hooks';
import RichText from './components/rich-text';

export const TransactionScreen = observer(
  ({
    actionPrefix,
    inputs,
  }: {
    actionPrefix?: string;
    inputs: ReactNode[];
  }) => {
    const theme = useTheme();
    const [infoTab, setInfoTab] = useState(0);
    const trade = useCurrentTradeContext();
    const vaultMetadata = useVaultMetadata(trade?.vaultAddress);
    const isReady = vaultMetadata !== undefined;
    const apyInfo = trade?.getAPYFactors();

    const tabs = useInfoBox();

    return (
      <FeatureLoader featureLoaded={isReady === true}>
        <ScreenContainer>
          <Header
            title={
              actionPrefix
                ? `${actionPrefix}: ${vaultMetadata?.name || ''}`
                : vaultMetadata?.name || ''
            }
            tokenSymbol={vaultMetadata?.depositToken.symbol || ''}
            secondaryTitle={vaultMetadata?.vaultFeatures.map((feature) => (
              <Chip
                label={feature}
                color="info"
                size="small"
                sx={{
                  backgroundColor: theme.palette.info.light,
                  color: theme.palette.info.dark,
                }}
              />
            ))}
            apyInfo={apyInfo}
          />
          <ContentContainer>
            <TopSection>
              <InputContainer>{inputs}</InputContainer>
              <InfoBox tabs={tabs} />
            </TopSection>
            <DataSection />
            <TradeSummaryBox>
              <SimpleToggle
                selectedTabIndex={infoTab}
                tabVariant="standard"
                tabLabels={[
                  <Box
                    sx={{ padding: theme.spacing(0, 2) }}
                    key="strategy-info"
                  >
                    <FormattedMessage defaultMessage="Strategy Info" />
                  </Box>,
                  <Box sx={{ padding: theme.spacing(0, 2) }} key="asset-info">
                    <FormattedMessage defaultMessage="Asset Info" />
                  </Box>,
                  <Box sx={{ padding: theme.spacing(0, 2) }} key="project-info">
                    <FormattedMessage defaultMessage="Project Info" />
                  </Box>,
                ]}
                onChange={(_, value) => {
                  setInfoTab(value as number);
                }}
              />
              {infoTab === 0 && (
                <RichText htmlInput={vaultMetadata?.vaultDescription || ''} />
              )}
              {infoTab === 1 && <Body>"Asset Info"</Body>}
              {infoTab === 2 && <Body>"Project Info"</Body>}
            </TradeSummaryBox>
          </ContentContainer>
        </ScreenContainer>
      </FeatureLoader>
    );
  }
);

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
  height: ${theme.spacing(60)};
  padding-bottom: ${theme.spacing(4)};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`
);
