import { Box, Chip, styled, useTheme } from '@mui/material';
import { MultiTokenIcon } from '@notional-finance/icons';
import { H2, H4 } from '@notional-finance/mui';
import {
  useAppStore,
  useCurrentTradeContext,
  useVaultMetadata,
} from '@notional-finance/notionable-hooks';
import { APYBeforePoints, APYBox } from './apy-header';
import { observer } from 'mobx-react-lite';

interface HeaderProps {
  actionPrefix?: string;
  isPointsOnly?: boolean;
}

// Header Component
const Header = observer(({ actionPrefix, isPointsOnly }: HeaderProps) => {
  const { isMobileView } = useAppStore();
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const tradeType = trade?.tradeType;
  const vaultMetadata = useVaultMetadata(trade?.vaultAddress);
  const title = actionPrefix
    ? `${actionPrefix}: ${vaultMetadata?.name || ''}`
    : vaultMetadata?.name || '';
  const tokenSymbol = vaultMetadata?.depositToken.symbol || '';
  const features: string[] = vaultMetadata?.vaultFeatures || [];
  const { leveragedAPY } = trade?.getVaultAPYBreakdown() || {};

  return (
    <HeaderContainer>
      <LeftSection>
        {tokenSymbol && (
          <MultiTokenIcon
            symbols={[
              vaultMetadata?.vaultIcon,
              vaultMetadata?.depositToken.symbol,
            ]}
            size="xl"
          />
        )}
        <Column
          sx={{
            alignItems: { xs: 'flex-end', sm: 'flex-start' },
            justifyContent: 'center',
            textAlign: { xs: 'right', sm: 'left' },
            width: { xs: 'auto', sm: 'auto' },
            alignSelf: { xs: 'auto', sm: 'auto' },
          }}
        >
          {isMobileView ? <H4>{title}</H4> : <H2>{title}</H2>}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: theme.spacing(1),
              flexWrap: 'wrap',
              justifyContent: isMobileView ? 'flex-end' : 'flex-start',
            }}
          >
            {tradeType === 'ManageVault'
              ? features?.map((feature) => (
                  <Chip
                    key={feature}
                    label={feature}
                    color="info"
                    size="small"
                    sx={{
                      backgroundColor: theme.palette.info.light,
                      color: theme.palette.info.dark,
                    }}
                  />
                ))
              : actionPrefix}
          </Box>
        </Column>
      </LeftSection>
      <RightSection>
        {leveragedAPY && (
          <Column
            sx={{
              alignItems: { xs: 'flex-end', sm: 'flex-end' },
              padding: theme.spacing(1.5, 3),
              backgroundColor: theme.palette.background.paper,
              borderRadius: theme.shape.borderRadius(),
              border: theme.shape.borderStandard,
              width: '100%',
            }}
          >
            {isPointsOnly ? (
              <APYBeforePoints apyInfo={leveragedAPY} />
            ) : (
              <APYBox apyInfo={leveragedAPY} />
            )}
          </Column>
        )}
      </RightSection>
    </HeaderContainer>
  );
});

const HeaderContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing(2)};
    padding: ${theme.spacing(2, 0)};

    ${theme.breakpoints.down('sm')} {
      flex-direction: column;
      align-items: flex-start;
      gap: ${theme.spacing(2.5)};
    }
    `
);

const Column = styled(Box)(
  () => `
    display: flex;
    flex-direction: column;
  `
);

const LeftSection = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${theme.spacing(1)};

    ${theme.breakpoints.down('sm')} {
      width: 100%;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      gap: ${theme.spacing(1.5)};
    }
  `
);

const RightSection = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: row;
    align-self: flex-end;
    gap: ${theme.spacing(1)};

    ${theme.breakpoints.down('sm')} {
      width: 100%;
      align-self: stretch;
      justify-content: flex-start;
    }
  `
);
export default Header;
