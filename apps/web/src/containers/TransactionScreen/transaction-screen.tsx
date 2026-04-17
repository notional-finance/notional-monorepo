import { ReactNode, useEffect } from 'react';
import { Box, styled } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { FeatureLoader } from '@notional-finance/shared-web';
import { MessageDescriptor } from 'react-intl';

import Header from './components/header';
import InfoBox from './components/info-box';
import DataSection from './components/data-section';
import Description from './components/description';
import InputContainer from './components/input-container';
import { useInfoBox } from './hooks/use-info-box';
import {
  useCurrentTradeContext,
  useVaultMetadata,
} from '@notional-finance/notionable-hooks';

export const TransactionScreen = observer(
  ({
    actionPrefix,
    inputs,
    hasBackButton,
    submitText,
    errorMessageOverride,
    hideSubmitButton,
    canSubmitOverride,
    onSubmitOverride,
  }: {
    actionPrefix?: string;
    hasBackButton?: boolean;
    submitText?: MessageDescriptor;
    errorMessageOverride?: MessageDescriptor;
    hideSubmitButton?: boolean;
    canSubmitOverride?: boolean;
    onSubmitOverride?: () => void;
    inputs: ReactNode[];
  }) => {
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
                errorMessageOverride={errorMessageOverride}
                hideSubmitButton={hideSubmitButton}
                canSubmitOverride={canSubmitOverride}
                onSubmitOverride={onSubmitOverride}
              >
                {inputs}
              </InputContainer>
              <InfoBox tabs={tabs} />
            </TopSection>
            <DataSection />
            <Description vaultAddress={trade?.vaultAddress} />
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
    height: auto;
  }
`
);
