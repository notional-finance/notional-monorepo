import { Typography, Box, styled, useTheme } from '@mui/material';
import { PORTFOLIO_ACTIONS, useQueryParams } from '@notional-finance/utils';
import { ExternalLink } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { messages } from '../messages';
import { useAddToCalendar } from './use-add-to-calendar';

export const AddToCalendar = () => {
  const theme = useTheme();
  const { date } = useQueryParams();
  const calData = useAddToCalendar(date);

  return (
    <Box>
      <Title>
        <FormattedMessage {...messages[PORTFOLIO_ACTIONS.ADD_TO_CALENDAR].heading} />
      </Title>
      {calData.map(({ label, Icon, href }, index) => (
        <WalletButton key={index}>
          <ExternalLink
            href={href}
            fitContent
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: theme.spacing(2.5),
            }}
          >
            <Box
              sx={{
                height: '35px',
                width: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon style={{ height: '35px', width: '35px' }} />
            </Box>
            <Box sx={{ whiteSpace: 'nowrap', marginLeft: '15px' }}>{label}</Box>
          </ExternalLink>
        </WalletButton>
      ))}
    </Box>
  );
};

const Title = styled(Typography)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(2.5)};
  font-weight: 700;
  color: ${theme.palette.primary.dark};
  text-transform: uppercase;
  `
);

const WalletButton = styled(Box)(
  ({ theme }) => `
  border-radius: ${theme.shape.borderRadiusLarge};
  border: 1px solid ${theme.palette.borders.paper};
  margin: ${theme.spacing(1)} 0px;
  cursor: pointer;
  background: ${theme.palette.common.white};
  color: ${theme.palette.primary.dark};
  font-weight: 500;
  display: flex;
  align-items: center;
  &:hover {
    transition: .5s ease;
    background: ${theme.palette.info.light};
  }
  `
);
