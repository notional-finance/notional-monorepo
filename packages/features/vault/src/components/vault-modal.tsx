import { Body, H3, LinkText, Button } from '@notional-finance/mui';
import { Box, Modal as MuiModal, useTheme, styled } from '@mui/material';
import {
  setInLocalStorage,
  getFromLocalStorage,
} from '@notional-finance/helpers';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

export const VaultModal = () => {
  const theme = useTheme();
  const [tempClose, setTempClose] = useState(true);
  const vaultModalDismissed = getFromLocalStorage('vaultModal').dismissed;

  const handleCloseForever = () => {
    setInLocalStorage('vaultModal', { dismissed: true });
    setTempClose(false);
  };

  return (
    <MuiModal
      open={tempClose && vaultModalDismissed !== true}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Container>
        <H3 sx={{ marginBottom: theme.spacing(5), textAlign: 'center' }}>
          <FormattedMessage defaultMessage={'Important'} />
        </H3>
        <Body sx={{ marginBottom: theme.spacing(3) }}>
          <FormattedMessage
            defaultMessage={
              'This strategy earns APY from points distributed by partner protocols.'
            }
          />
        </Body>
        <Body sx={{ marginBottom: theme.spacing(3) }}>
          <FormattedMessage
            defaultMessage={'Point values are highly uncertain.'}
          />
        </Body>
        <Body sx={{ marginBottom: theme.spacing(3) }}>
          <FormattedMessage
            defaultMessage={
              'This strategy’s APY depends on assumptions of point values which could be wrong and would result in a different APY than what is shown.'
            }
          />
        </Body>
        <Body sx={{ marginBottom: theme.spacing(3) }}>
          <FormattedMessage
            defaultMessage={
              'For full accuracy, do your own research to make your own point value estimates.'
            }
          />
        </Body>
        <Box
          sx={{
            marginTop: theme.spacing(5),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Button
            size="large"
            sx={{
              cursor: 'pointer',
              marginBottom: theme.spacing(2),
            }}
            onClick={() => setTempClose(false)}
          >
            <FormattedMessage defaultMessage={'I Understand'} />
          </Button>
          <LinkText sx={{ cursor: 'pointer' }} onClick={handleCloseForever}>
            <FormattedMessage defaultMessage={'Dismiss Forever'} />
          </LinkText>
        </Box>
      </Container>
    </MuiModal>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${theme.spacing(69)};
    background: ${theme.palette.background.paper};
    padding: ${theme.spacing(6, 11)};
    outline: none;
     &:focus: {
        outline: none;
    }
      `
);

export default VaultModal;
