import { useState } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import {
  SimpleToggle,
  TradeSummaryBox,
  Body,
  useCurrencyInputRef,
} from '@notional-finance/mui';
import { observer } from 'mobx-react-lite';
import { FeatureLoader } from '@notional-finance/shared-web';
import { defineMessage, FormattedMessage } from 'react-intl';

import Chip from '@mui/material/Chip';
import Header from './components/header';
import InfoBox from './components/info-box';
import DataSection from './components/data-section';
import InputContainer from './components/input-container';
import { useInfoBox } from './hooks/use-info-box';
import { DepositInput, LeverageSlider } from '@notional-finance/trade';
import { useTradeContext } from '@notional-finance/notionable-hooks';

const TransactionScreen = () => {
  const theme = useTheme();
  const isReady = true;
  const [infoTab, setInfoTab] = useState(0);
  const { currencyInputRef } = useCurrencyInputRef();
  useTradeContext('CreateVaultPosition');

  const tabs = useInfoBox();

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
            <InputContainer>
              <DepositInput
                inputLabel={defineMessage({
                  defaultMessage: 'Deposit',
                })}
                inputRef={currencyInputRef}
              />
              <LeverageSlider
                inputLabel={defineMessage({
                  defaultMessage: 'Leverage',
                })}
              />
            </InputContainer>
            <InfoBox tabs={tabs} />
          </TopSection>
          <DataSection />
          <TradeSummaryBox>
            <SimpleToggle
              selectedTabIndex={infoTab}
              tabVariant="standard"
              tabLabels={[
                <Box sx={{ padding: theme.spacing(0, 2) }} key="strategy-info">
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
            {infoTab === 0 && <Body>"Strategy Info"</Body>}
            {infoTab === 1 && <Body>"Asset Info"</Body>}
            {infoTab === 2 && <Body>"Project Info"</Body>}
          </TradeSummaryBox>
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
  height: ${theme.spacing(60)};
  padding-bottom: ${theme.spacing(4)};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`
);

export default observer(TransactionScreen);
