import { observer } from 'mobx-react-lite';
import { Box, styled, useTheme } from '@mui/material';
import { Body, HeaderToggle } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useState, useMemo } from 'react';
import PortfolioTab from './components/portfolio-tab';
import VaultTab from './components/vault-tab';
import {
  useAccountDefinition,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';

const PortfolioRiskMobile = () => {
  const theme = useTheme();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const network = useSelectedNetwork();
  const account = useAccountDefinition(network);

  const hasPortfolioRisk = useMemo(
    () => !!account?.balances.find((t) => t.isNegative() && !t.isVaultToken),
    [account?.balances]
  );
  const hasVaultRisk = useMemo(
    () => !!account?.balances.find((t) => t.isVaultToken),
    [account?.balances]
  );

  const showTabs = useMemo(
    () => hasPortfolioRisk && hasVaultRisk,
    [hasPortfolioRisk, hasVaultRisk]
  );
  const effectiveTabIndex = useMemo(() => {
    if (showTabs) return selectedTabIndex;
    return hasPortfolioRisk ? 0 : hasVaultRisk ? 1 : 0;
  }, [showTabs, selectedTabIndex, hasPortfolioRisk, hasVaultRisk]);

  return (
    <Box>
      {showTabs && (
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
      )}

      <Box>
        {effectiveTabIndex === 0 && <PortfolioTab />}
        {effectiveTabIndex === 1 && <VaultTab />}
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
