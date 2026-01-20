import { observer } from 'mobx-react-lite';
import { Box, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import { TokenIcon } from '@notional-finance/icons';
import { formatHealthFactorValues } from '@notional-finance/notionable-hooks';
import { Body, Button, H4, LabelValue } from '@notional-finance/mui';
import { useVaultRiskTable } from '../../../hooks';

const VaultTab = () => {
  const theme = useTheme();
  const { riskTableData } = useVaultRiskTable();

  return (
    <Container>
      <Box>
        {riskTableData.map((item) => (
          <Card>
            <TokenContainer>
              <TokenIcon symbol={item.vault.symbol} size={'xl'} />
              <Box>
                <H4>{item.vault.label}</H4>
              </Box>
            </TokenContainer>

            <Row>
              <Body sx={{ color: theme.palette.typography.main }}>
                Health Factor
              </Body>
              <LabelValue
                sx={{
                  color: formatHealthFactorValues(item.healthFactor, theme),
                }}
              >
                {item.healthFactor
                  ? `${item.healthFactor.toFixed(2)} / 5`
                  : '-'}
              </LabelValue>
            </Row>

            <Row>
              <Body sx={{ color: theme.palette.typography.main }}>
                Exchange Rate
              </Body>

              <Row sx={{ width: 'fit-content', gap: 1 }}>
                <LabelValue>{item.exchangeRate}</LabelValue>
              </Row>
            </Row>

            <Row>
              <Body sx={{ color: theme.palette.typography.main }}>
                Liquidation Price
              </Body>
              <LabelValue>{item.liquidationPrice}</LabelValue>
            </Row>

            <Row>
              <Body sx={{ color: theme.palette.typography.main }}>
                Current Price
              </Body>
              <LabelValue>{item.currentPrice}</LabelValue>
            </Row>

            <Box sx={{ width: '100%' }}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                to={item.manageLink}
              >
                <FormattedMessage defaultMessage={'Manage'} />
              </Button>
            </Box>
            {/* <ActionButtonComponent /> */}
          </Card>
        ))}
      </Box>
    </Container>
  );
};

// const ActionButtonComponent = () => {
//   const theme = useTheme();
//   const bottomDrawerRef = useRef<BottomDrawerRef>(null);

//   return (
//     <BottomDrawer
//       ref={bottomDrawerRef}
//       trigger={
//         <Button variant="outlined" color="primary" fullWidth>
//           <FormattedMessage defaultMessage={'Manage'} />
//         </Button>
//       }
//       title="Manage"
//     >
//       <Button
//         variant="text"
//         sx={{
//           color: theme.palette.typography.main,
//           justifyContent: 'space-between',
//         }}
//         fullWidth
//       >
//         <FormattedMessage defaultMessage={'Withdraw'} />
//       </Button>
//       <Divider sx={{ margin: theme.spacing(1, 0) }} />
//       <Button
//         variant="text"
//         sx={{
//           color: theme.palette.typography.main,
//           justifyContent: 'space-between',
//         }}
//         fullWidth
//       >
//         <FormattedMessage defaultMessage={'Adjust Leverage'} />
//       </Button>
//       <Divider sx={{ margin: theme.spacing(1, 0) }} />
//       <Button
//         variant="text"
//         sx={{
//           color: theme.palette.typography.main,
//           justifyContent: 'space-between',
//         }}
//         fullWidth
//       >
//         <FormattedMessage defaultMessage={'Deposit'} />
//         <H4>9.58% APY</H4>
//       </Button>
//       <Divider sx={{ margin: theme.spacing(1, 0) }} />
//       <Button
//         variant="text"
//         sx={{
//           color: theme.palette.typography.main,
//           justifyContent: 'space-between',
//         }}
//         fullWidth
//       >
//         <FormattedMessage defaultMessage={'Convert to Fixed (Mar 12 2025)'} />
//         <H4>9.58% APY</H4>
//       </Button>
//       <Divider sx={{ margin: theme.spacing(1, 0) }} />
//       <Button
//         variant="text"
//         sx={{
//           color: theme.palette.typography.main,
//           justifyContent: 'space-between',
//         }}
//         fullWidth
//       >
//         <FormattedMessage defaultMessage={'Convert to Fixed (Jun 10 2025)'} />
//         <H4>9.58% APY</H4>
//       </Button>
//       <Divider sx={{ margin: theme.spacing(1, 0) }} />
//       <Button
//         variant="text"
//         sx={{
//           color: theme.palette.typography.light,
//           height: theme.spacing(6),
//         }}
//         fullWidth
//         onClick={() => bottomDrawerRef.current?.close()}
//       >
//         <FormattedMessage defaultMessage={'Cancel'} />
//       </Button>
//     </BottomDrawer>
//   );
// };

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  paddingTop: theme.spacing(2),
}));

const Row = styled(Box)(() => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const TokenContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexDirection: 'row',
  gap: theme.spacing(1),
}));

const Card = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'column',
  gap: theme.spacing(2),
  background: theme.palette.background.paper,
  padding: theme.spacing(3, 2),
  borderTop: `1px solid ${theme.palette.borders.paper}`,
  '&:last-child': {
    borderBottom: `1px solid ${theme.palette.borders.paper}`,
  },
}));

export default observer(VaultTab);
