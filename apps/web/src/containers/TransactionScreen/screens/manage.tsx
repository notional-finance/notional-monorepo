import { TransactionScreen } from '../transaction-screen';
import { observer } from 'mobx-react-lite';
import {
  useTradeContext,
  useVaultMetadata,
} from '@notional-finance/notionable-hooks';
import { useParams } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { alpha, Box, styled } from '@mui/material';
import { Button, ButtonText, Caption, H5 } from '@notional-finance/mui';
import { Network } from '@notional-finance/util';
import { useClaimRewards } from './claim-rewards';

export const VaultManageScreen = observer(() => {
  useTradeContext('ManageVault');
  const { vaultAddress, selectedNetwork } = useParams<{
    vaultAddress: string;
    selectedNetwork: Network;
  }>();
  const path = `/vault/${selectedNetwork}/${vaultAddress}`;
  const claimRewards = useClaimRewards();
  const metadata = useVaultMetadata(vaultAddress);

  const maintainLeverage: {
    label: React.ReactNode;
    disabled?: boolean;
    to?: string;
  }[] = [
    {
      label: <FormattedMessage defaultMessage="Deposit" />,
      to: `${path}/deposit`,
    },
  ];

  if (metadata?.vaultFeatures.includes('Instant Withdrawal')) {
    maintainLeverage.push({
      label: <FormattedMessage defaultMessage="Instant Withdraw" />,
      to: `${path}/instant-withdraw`,
    });
  }

  if (metadata?.vaultFeatures.includes('Smart Withdrawal')) {
    if (metadata?.strategyType === 'PendlePT' && metadata?.enabled) {
      maintainLeverage.push({
        label: (
          <Box>
            <ButtonText>
              <FormattedMessage defaultMessage="Smart Withdraw" />
            </ButtonText>
            <Caption>
              <FormattedMessage defaultMessage="Enabled after PT Expiration" />
            </Caption>
          </Box>
        ),
        disabled: true,
      });
    } else {
      maintainLeverage.push({
        label: <FormattedMessage defaultMessage="Smart Withdraw" />,
        to: `${path}/smart-withdraw`,
      });
    }
  }

  const adjustLeverage = [
    {
      label: <FormattedMessage defaultMessage="Adjust Leverage" />,
      to: `${path}/adjust-leverage`,
    },
    // {
    //   label: <FormattedMessage defaultMessage="Deposit" />,
    //   to: `${path}/deposit`,
    // },
    // {
    //   label: <FormattedMessage defaultMessage="Borrow" />,
    //   to: `${path}/borrow`,
    // },
    // {
    //   label: <FormattedMessage defaultMessage="Repay" />,
    //   to: `${path}/repay`,
    // },
    // {
    //   label: <FormattedMessage defaultMessage="Sell Assets" />,
    //   to: `${path}/sell-assets`,
    // },
  ];

  const inputs = [
    <ManageButtonSection
      key="deposit-withdraw"
      heading={<FormattedMessage defaultMessage="Deposit / Withdraw" />}
      links={maintainLeverage}
    />,
    <ManageButtonSection
      key="adjust-leverage"
      heading={<FormattedMessage defaultMessage="Adjust Leverage" />}
      links={adjustLeverage}
    />,
  ];

  if (claimRewards) {
    inputs.push(
      <ManageButtonSection
        key="claim-rewards"
        heading={<FormattedMessage defaultMessage="Claim Rewards" />}
        links={[
          {
            label: <FormattedMessage defaultMessage="Claim Rewards" />,
            to: `${path}/manage`,
            onClick: claimRewards,
          },
        ]}
      />
    );
  }

  return (
    <TransactionScreen actionPrefix="Manage" hideSubmitButton inputs={inputs} />
  );
});

const ManageButtonSection = ({
  heading,
  links,
}: {
  heading: React.ReactNode;
  links: {
    label: React.ReactNode;
    disabled?: boolean;
    to?: string;
    onClick?: () => void;
  }[];
}) => {
  return (
    <Box>
      <H5>{heading}</H5>
      <ManageButtonGrid>
        {links.map((link) => (
          <ManageButton
            to={link.to}
            key={link.to}
            onClick={link.onClick}
            disabled={link.disabled}
          >
            {link.label}
          </ManageButton>
        ))}
      </ManageButtonGrid>
    </Box>
  );
};

const ManageButtonGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(1),
  width: '100%',
  marginTop: theme.spacing(1),
  '& a': {
    height: theme.spacing(7),
  },
}));

const ManageButton = styled(Button)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  width: '100%',
  height: '100%',
  background: theme.palette.info.light,
  color: theme.palette.typography.main,
  '&:hover': {
    background: alpha(theme.palette.info.dark, 0.5),
  },
}));
