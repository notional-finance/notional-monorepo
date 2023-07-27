import { Box, useTheme } from '@mui/material';
import { ActionRowButton } from '../action-row-button/action-row-button';
import { MainContainer } from './table-action-row';
import { defineMessages } from 'react-intl';

interface VaultActionRowProps {
  row: {
    original: {
      actionRow: {
        maturity: string;
        routes: {
          manageVault?: string;
          txnHistory?: string;
        };
      };
    };
  };
}

export const VaultActionRow = ({ row }: VaultActionRowProps) => {
  const theme = useTheme();
  const { routes } = row.original.actionRow;
  return (
    <MainContainer>
      <Box sx={{ display: 'flex', width: '100%' }}>
        {routes.manageVault && (
          <ActionRowButton
            {...defineMessages({
              label: {
                defaultMessage: 'Manage Vault',
                description: 'button text',
              },
            })}
            route={routes.manageVault}
            sx={{ marginLeft: theme.spacing(3) }}
          />
        )}
        {routes.txnHistory && (
          <ActionRowButton
            {...defineMessages({
              label: {
                defaultMessage: 'Transaction History',
                description: 'button text',
              },
            })}
            route={routes.txnHistory}
            sx={{ marginLeft: theme.spacing(3) }}
          />
        )}
      </Box>
    </MainContainer>
  );
};
