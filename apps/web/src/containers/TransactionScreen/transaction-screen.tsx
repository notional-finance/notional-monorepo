import { useState, ReactNode, useEffect } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { SimpleToggle, TradeSummaryBox } from '@notional-finance/mui';
import { observer } from 'mobx-react-lite';
import { FeatureLoader } from '@notional-finance/shared-web';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

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
    hasBackButton,
    submitText,
    hideSubmitButton,
    canSubmitOverride,
    onSubmitOverride,
  }: {
    actionPrefix?: string;
    hasBackButton?: boolean;
    submitText?: MessageDescriptor;
    hideSubmitButton?: boolean;
    canSubmitOverride?: boolean;
    onSubmitOverride?: () => void;
    inputs: ReactNode[];
  }) => {
    const theme = useTheme();
    const [infoTab, setInfoTab] = useState(0);
    const trade = useCurrentTradeContext();
    const vaultMetadata = useVaultMetadata(trade?.vaultAddress);
    const isReady = vaultMetadata !== undefined;
    const tabs = useInfoBox();
    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

    return (
      <FeatureLoader featureLoaded={isReady === true}>
        <ScreenContainer>
          <Header actionPrefix={actionPrefix} />
          <ContentContainer>
            <TopSection>
              <InputContainer
                hasBackButton={hasBackButton}
                submitText={submitText}
                hideSubmitButton={hideSubmitButton}
                canSubmitOverride={canSubmitOverride}
                onSubmitOverride={onSubmitOverride}
              >
                {inputs}
              </InputContainer>
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
              <Box sx={{ width: '100%', padding: theme.spacing(2) }}></Box>
              {infoTab === 0 && (
                <RichText htmlInput={vaultMetadata?.vaultDescription || ''} />
              )}
              {infoTab === 1 && (
                <RichText
                  htmlInput={
                    vaultMetadata?.vaultAssets
                      .map(
                        (asset) =>
                          `<h1>${asset.name}</h1><div>${asset.description}</div>`
                      )
                      .join('<br />') || ''
                  }
                />
              )}
              {infoTab === 2 && (
                <RichText
                  htmlInput={
                    vaultMetadata?.projects
                      .map((project) => project.description)
                      .join('<br />') || ''
                  }
                />
              )}
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

  ${theme.breakpoints.down('sm')} {
    margin: ${theme.spacing(3)} auto;
  }
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
