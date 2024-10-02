import { Box, useTheme, Divider } from '@mui/material';
import {
  Button,
  Caption,
  H4,
  H5,
  Paragraph,
  Subtitle,
} from '@notional-finance/mui';
import {
  useAccountReady,
  useWalletAllowances,
  useWalletConnectedNetwork,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { SupportedNetworks, UNLIMITED_APPROVAL } from '@notional-finance/util';
import { Title } from '../../settings-side-drawer';
import { TokenBalance } from '@notional-finance/core-entities';
import { EditIcon, TokenIcon } from '@notional-finance/icons';
import { useChangeNetwork, useTokenApproval } from '@notional-finance/trade';

export const EnabledCurrenciesButton = () => {
  const theme = useTheme();
  const network = useWalletConnectedNetwork();
  const walletConnected = useAccountReady(network);
  const allowances = useWalletAllowances();
  const numEnabled = Object.values(allowances).reduce(
    (n, a) => n + a.length,
    0
  );

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box sx={{ paddingRight: theme.spacing(1), display: 'flex' }}>
        {walletConnected && (
          <Box>
            {numEnabled}&nbsp;
            <FormattedMessage defaultMessage={'Enabled'} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

const TokenAllowanceRow = ({ amount }: { amount: TokenBalance }) => {
  const theme = useTheme();
  const network = useWalletConnectedNetwork();
  const walletConnected = useAccountReady(network);
  const isUnlimited = amount.n.gte(UNLIMITED_APPROVAL);
  const canEdit = network === amount.network && walletConnected;
  const { enableToken } = useTokenApproval(amount.symbol, amount.network);
  const changeNetwork = useChangeNetwork();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing(2),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          minWidth: theme.spacing(12),
        }}
      >
        <TokenIcon
          symbol={amount.symbol}
          size="medium"
          network={amount.network}
        />
        <Box marginLeft={theme.spacing(1.5)}>
          <H4>{amount.symbol}</H4>
          <Caption sx={{ textTransform: 'capitalize' }}>
            {amount.network}
          </Caption>
        </Box>
      </Box>
      <Box
        sx={{ display: 'flex', cursor: canEdit ? 'pointer' : 'auto' }}
        onClick={canEdit ? () => enableToken(false) : undefined}
      >
        <Subtitle accent marginRight={theme.spacing(0.5)}>
          {isUnlimited ? (
            <FormattedMessage defaultMessage={'Unlimited'} />
          ) : (
            amount.toDisplayStringWithSymbol(2, true)
          )}
        </Subtitle>
        {canEdit && <EditIcon />}
      </Box>
      <Button
        variant="outlined"
        sx={{
          borderColor: theme.palette.typography.accent,
          color: theme.palette.typography.accent,
        }}
        onClick={
          canEdit
            ? () => enableToken(false)
            : () => changeNetwork(amount.network)
        }
      >
        {canEdit ? (
          <FormattedMessage defaultMessage={'Revoke'} />
        ) : (
          <FormattedMessage defaultMessage={'Switch'} />
        )}
      </Button>
    </Box>
  );
};

export const EnabledCurrencies = () => {
  const theme = useTheme();
  const allowances = useWalletAllowances();

  return (
    <Box>
      <Title sx={{ marginBottom: theme.spacing(1) }}>
        <FormattedMessage defaultMessage={'Enabled Tokens'} />
      </Title>
      <Paragraph marginBottom={theme.spacing(4)}>
        <FormattedMessage
          defaultMessage={'Reset or revoke your token approvals below'}
        />
      </Paragraph>
      {SupportedNetworks.map((network, index) => {
        return (
          <Box
            key={index}
            sx={{
              width: '100%',
              display: 'block',
              marginBottom: theme.spacing(4),
            }}
          >
            <H5 gutter="default">{network}</H5>
            <Divider sx={{ marginBottom: theme.spacing(2) }} />
            {allowances[network].length === 0 ? (
              <Subtitle textAlign={'center'} light>
                <FormattedMessage defaultMessage={'No Approvals Set'} />
              </Subtitle>
            ) : (
              allowances[network].map((a, i) => (
                <TokenAllowanceRow key={i} amount={a.amount} />
              ))
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default EnabledCurrencies;
