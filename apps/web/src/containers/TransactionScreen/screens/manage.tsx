import { TransactionScreen } from '../transaction-screen';
import { observer } from 'mobx-react-lite';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { useParams } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { alpha, Box, styled } from '@mui/material';
import { Button, H5 } from '@notional-finance/mui';

export const VaultManageScreen = observer(() => {
  useTradeContext('ManageVault');
  const { vaultAddress, selectedNetwork } = useParams<{
    vaultAddress: string;
    selectedNetwork: string;
  }>();
  const path = `/vault/${selectedNetwork}/${vaultAddress}`;

  const maintainLeverage = [
    {
      label: <FormattedMessage defaultMessage="Increase" />,
      to: `${path}/increase`,
    },
    {
      label: <FormattedMessage defaultMessage="Instant Withdraw" />,
      to: `${path}/instant-withdraw`,
    },
    {
      label: <FormattedMessage defaultMessage="Smart Withdraw" />,
      to: `${path}/smart-withdraw`,
    },
  ];

  const adjustLeverage = [
    {
      label: <FormattedMessage defaultMessage="Deposit" />,
      to: `${path}/deposit`,
    },
    {
      label: <FormattedMessage defaultMessage="Borrow" />,
      to: `${path}/borrow`,
    },
    {
      label: <FormattedMessage defaultMessage="Repay" />,
      to: `${path}/repay`,
    },
    {
      label: <FormattedMessage defaultMessage="Sell Assets" />,
      to: `${path}/sell-assets`,
    },
  ];

  return (
    <TransactionScreen
      actionPrefix="Manage"
      inputs={[
        <ManageButtonSection
          heading={<FormattedMessage defaultMessage="Maintain Leverage" />}
          links={maintainLeverage}
        />,
        <ManageButtonSection
          heading={<FormattedMessage defaultMessage="Adjust Leverage" />}
          links={adjustLeverage}
        />,
      ]}
    />
  );
});

const ManageButtonSection = ({
  heading,
  links,
}: {
  heading: React.ReactNode;
  links: {
    label: React.ReactNode;
    to: string;
  }[];
}) => {
  return (
    <Box>
      <H5>{heading}</H5>
      <ManageButtonGrid>
        {links.map((link) => (
          <ManageButton to={link.to} key={link.to}>
            {link.label}
          </ManageButton>
        ))}
      </ManageButtonGrid>
    </Box>
  );
};

const ManageButtonGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(calc(33.33% - 8px), 1fr))',
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
