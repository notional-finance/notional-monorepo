import { Box, useTheme } from '@mui/material';
import { ActionRowButton } from '../action-row-button/action-row-button';
import { RemindMe } from '../remind-me/remind-me';
import { MainContainer } from './table-action-row';
import { defineMessages } from 'react-intl';

interface VaultActionRowProps {
  row: {
    original: {
      actionRow: {
        maturity: string;
        routes: {
          manageVault?: string;
        };
      };
    };
  };
}

export const VaultActionRow = ({ row }: VaultActionRowProps) => {
  const theme = useTheme();
  const { maturity, routes } = row.original.actionRow;
  return (
    <MainContainer>
      <RemindMe futureDate={maturity} />
      <Box sx={{ display: 'flex', width: '100%' }}>
        {routes.manageVault && (
          <ActionRowButton
            {...defineMessages({
              heading: {
                defaultMessage: 'Manage Vault',
                description: 'heading',
              },
              label: {
                defaultMessage: 'Manage Vault',
                description: 'button text',
              },
              tooltip: {
                defaultMessage: 'Manage your vault position.',
                description: 'button text',
              },
            })}
            route={routes.manageVault}
            sx={{ marginLeft: theme.spacing(3) }}
          />
        )}
      </Box>
    </MainContainer>
  );
};
