import { observer } from 'mobx-react-lite';
import { Box, styled, useTheme } from '@mui/material';
import { Body, HeaderToggle } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useState } from 'react';
import PortfolioTab from './components/portfolio-tab';
import VaultTab from './components/vault-tab';

const PortfolioRiskMobile = () => {
  const theme = useTheme();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Box>
      <ToggleContainer>
        <HeaderToggle
          tabLabels={[
            <Body
              sx={{
                width: theme.spacing(18.75),
              }}
            >
              <FormattedMessage defaultMessage={'Portfolio Holdings'} />
            </Body>,
            <Body
              sx={{
                width: theme.spacing(18.75),
              }}
            >
              <FormattedMessage defaultMessage={'Leverage Vaults'} />
            </Body>,
          ]}
          selectedTabIndex={selectedTabIndex}
          onChange={(_, v) => {
            setSelectedTabIndex(v as number);
          }}
        />
      </ToggleContainer>

      <Box>
        {selectedTabIndex === 0 && <PortfolioTab />}
        {selectedTabIndex === 1 && <VaultTab />}
      </Box>
    </Box>
  );
};

const ToggleContainer = styled(Box)(
  ({ theme }) => `
      margin: ${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(1)};
    `
);

export default observer(PortfolioRiskMobile);
