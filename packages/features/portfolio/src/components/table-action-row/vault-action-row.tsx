import { Box, Divider, styled, useTheme } from '@mui/material';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { useParams } from 'react-router';
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
          deleveragePosition?: string;
          increasePosition?: string;
          withdrawPosition?: string;
          rollPosition?: string;
        };
      };
    };
  };
}

const CustomDivider = styled(Divider)(
  ({ theme }) => `
  color: ${theme.palette.borders.accentPaper};
  margin-left: ${theme.spacing(3)};
`
);

export const VaultActionRow = ({ row }: VaultActionRowProps) => {
  const theme = useTheme();
  const { category } = useParams<PortfolioParams>();
  const { maturity, routes } = row.original.actionRow;

  return (
    <MainContainer>
      <RemindMe futureDate={maturity} />
      <Box sx={{ display: 'flex', width: '100%' }}>
        {routes.increasePosition && (
          <ActionRowButton
            {...defineMessages({
              heading: {
                defaultMessage: 'Increase Position',
                description: 'heading',
              },
              label: {
                defaultMessage: 'Increase',
                description: 'button text',
              },
              tooltip: {
                defaultMessage:
                  'Increase your position in this vault by depositing or borrowing more.',
                description: 'button text',
              },
            })}
            route={routes.increasePosition}
            sx={{ marginLeft: theme.spacing(3) }}
          />
        )}
        {routes.increasePosition &&
          (routes.rollPosition || routes.deleveragePosition || routes.withdrawPosition) && (
            <CustomDivider orientation="vertical" flexItem />
          )}
        {routes.rollPosition && (
          <ActionRowButton
            {...defineMessages({
              heading: {
                defaultMessage: 'Roll Maturity',
                description: 'heading',
              },
              label: {
                defaultMessage: 'Roll Maturity',
                description: 'button text',
              },
              tooltip: {
                defaultMessage:
                  'Roll your vault position to a longer dated maturity at a new fixed rate to avoid settlement.',
                description: 'button text',
              },
            })}
            route={routes.rollPosition}
            sx={{ marginLeft: theme.spacing(3) }}
          />
        )}
        {routes.rollPosition && (routes.deleveragePosition || routes.withdrawPosition) && (
          <CustomDivider orientation="vertical" flexItem />
        )}
        {routes.deleveragePosition && (
          <ActionRowButton
            {...defineMessages({
              heading: {
                defaultMessage: 'Deleverage Position',
                description: 'heading',
              },
              label: {
                defaultMessage: 'Deleverage',
                description: 'button text',
              },
              tooltip: {
                defaultMessage:
                  'Your vault position is at risk of liquidation, deleverage your position to reduce your leverage ratio and your liquidation risk.',
                description: 'button text',
              },
            })}
            route={`/portfolio/${category}/${routes.deleveragePosition}`}
            sx={{ marginLeft: theme.spacing(3) }}
          />
        )}
        {/* only show withdraw if there is no risk position */}
        {!routes.deleveragePosition && routes.withdrawPosition && (
          <ActionRowButton
            {...defineMessages({
              heading: {
                defaultMessage: 'Withdraw Position',
                description: 'heading',
              },
              label: {
                defaultMessage: 'Withdraw',
                description: 'button text',
              },
              tooltip: {
                defaultMessage: 'Withdraw your assets from the vault.',
                description: 'button text',
              },
            })}
            route={`/portfolio/${category}/${routes.withdrawPosition}`}
            sx={{ marginLeft: theme.spacing(3) }}
          />
        )}
      </Box>
    </MainContainer>
  );
};
