import { observer } from 'mobx-react-lite';
import { Box, styled, useTheme } from '@mui/material';
import {
  Button,
  DataTable,
  H4,
  H5,
  SliderRisk,
  Subtitle,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useState, useMemo } from 'react';
import {
  useAccountDefinition,
  useAppStore,
  usePortfolioRiskProfile,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import {
  ClaimNoteButton,
  PortfolioPageHeader,
} from '@notional-finance/portfolio-feature-shell/components';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import { useLiquidationRisk } from '../portfolio-holdings/use-liquidation-risk';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { ArrowIcon } from '@notional-finance/icons';
import { useVaultRiskTable } from '@notional-finance/portfolio-feature-shell/hooks';

const PortfolioRiskDesktop = () => {
  const theme = useTheme();
  const network = useSelectedNetwork();
  const { baseCurrency } = useAppStore();
  const account = useAccountDefinition(network);
  const profile = usePortfolioRiskProfile(network);
  const { liquidationRiskData, liquidationRiskColumns } =
    useLiquidationRisk(baseCurrency);
  const { riskTableData, riskTableColumns } = useVaultRiskTable();

  const [isReduceRiskDropdownOpen, setIsReduceRiskDropdownOpen] =
    useState(false);

  const hasPortfolioRisk = useMemo(
    () => !!account?.balances.find((t) => t.isNegative() && !t.isVaultToken),
    [account?.balances]
  );
  const hasVaultRisk = useMemo(
    () => !!account?.balances.find((t) => t.isVaultToken),
    [account?.balances]
  );

  return (
    <Box>
      <PortfolioPageHeader category={PORTFOLIO_CATEGORIES.RISK}>
        <ClaimNoteButton />
      </PortfolioPageHeader>
      <Container>
        <Card>
          <Box sx={{ padding: theme.spacing(2), width: '100%' }}>
            <Header>
              <FormattedMessage defaultMessage={'Portfolio Health Factor'} />
              <InfoOutlinedIcon
                sx={{ fontSize: '16px', color: theme.palette.primary.light }}
              />
            </Header>

            <Row sx={{ gap: theme.spacing(2) }}>
              <SliderRisk
                healthFactor={profile?.healthFactor || null}
                style={{
                  width: '100%',
                  maxWidth: '445px',
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: '6px',
                  border: `1px solid ${theme.palette.borders.paper}`,
                  padding: theme.spacing(0, 2),

                  marginBottom: theme.spacing(3),

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: theme.spacing(3),
                }}
                isLabelWithColor
              />

              <Column>
                <H5>
                  <FormattedMessage defaultMessage={'Total Collateral'} />
                </H5>
                <H4>
                  {profile?.totalAssets
                    .toFiat(baseCurrency)
                    .toDisplayStringWithSymbol(2, true) || '-'}
                </H4>
              </Column>
              <Column>
                <H5>
                  <FormattedMessage defaultMessage={'Total Debt'} />
                </H5>
                <H4>
                  {profile?.totalDebt
                    .abs()
                    .toFiat(baseCurrency)
                    .toDisplayStringWithSymbol(2, true) || '-'}
                </H4>
              </Column>
              <Column>
                <H5>
                  <FormattedMessage defaultMessage={'Loan to Value'} />
                </H5>
                <H4>
                  {profile?.loanToValue
                    ? formatNumberAsPercent(profile.loanToValue, 2)
                    : '-'}
                </H4>
              </Column>

              <DropdownButton
                id="reduce-risk-dropdown"
                aria-controls={
                  isReduceRiskDropdownOpen ? 'reduce-risk-menu' : undefined
                }
                aria-haspopup="true"
                variant="contained"
                aria-expanded={isReduceRiskDropdownOpen ? 'true' : undefined}
                onClick={() =>
                  setIsReduceRiskDropdownOpen(!isReduceRiskDropdownOpen)
                }
                endIcon={
                  <Box
                    sx={{
                      marginLeft: theme.spacing(1),
                      height: theme.spacing(2),
                      width: theme.spacing(2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: theme.palette.info.light,
                      boxShadow: 'none',
                    }}
                  >
                    <ArrowIcon
                      sx={{
                        transform: isReduceRiskDropdownOpen
                          ? 'rotate(0deg)'
                          : 'rotate(-180deg)',
                        transition: '.5s ease',
                        width: theme.spacing(1.5),
                        color: theme.palette.typography.white,
                      }}
                    />
                  </Box>
                }
              >
                <Subtitle sx={{ color: theme.palette.typography.white }}>
                  Reduce Risk
                </Subtitle>
              </DropdownButton>
            </Row>
          </Box>
          {hasPortfolioRisk && (
            <DataTable
              data={liquidationRiskData}
              columns={liquidationRiskColumns}
              sx={{
                background: 'transparent',
                border: 'none',
              }}
            />
          )}
        </Card>

        {hasVaultRisk && (
          <DataTable
            data={riskTableData}
            columns={[
              ...riskTableColumns,
              {
                cell: ManageButton,
                expandableTable: true,
                accessorKey: 'manage',
                textAlign: 'right',
              },
            ]}
            tableTitle={
              <FormattedMessage
                defaultMessage={'Leveraged Vaults Liquidation Risk'}
              />
            }
          />
        )}
      </Container>
    </Box>
  );
};

const ManageButton = () => {
  return (
    <Button variant="contained" color="primary">
      Manage
    </Button>
  );
};

export const Container = styled(Box)(
  ({ theme }) => `
    margin-bottom: ${theme.spacing(4)};
    ${theme.breakpoints.down('sm')} {
      margin-top: ${theme.spacing(1)};
    }
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing(3)};
  `
);

const Header = styled(H4)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const Row = styled(Box)(() => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const Column = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const Card = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.borders.paper}`,
  borderRadius: '6px',
  padding: theme.spacing(3),
}));

const DropdownButton = styled(Button)(({ theme }) => ({
  transition: 'none',
  width: 'fit-content',
  textTransform: 'capitalize',
  justifyContent: 'flex-start',
  height: '42px',
  boxShadow: 'none',
  borderRadius: theme.spacing(0.5),
  minWidth: 'fit-content',
}));

export default observer(PortfolioRiskDesktop);
