import { Box, styled } from '@mui/material';
import {
  TableActionRow,
  TableActionRowProps,
} from '../table-action-row/table-action-row';
import { getDateString } from '@notional-finance/util';
import { Button, H4, H5 } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export const SNOTETableActionRow = ({ row }: TableActionRowProps) => {
  const {
    actionRow: { stakeNoteStatus },
  } = row.original;

  return (
    <Box>
      {stakeNoteStatus?.inCoolDown || stakeNoteStatus?.inRedeemWindow ? (
        <Container>
          <InnerContainer>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <H5>
                {stakeNoteStatus?.inCoolDown ? (
                  <FormattedMessage defaultMessage={'Redemption Window'} />
                ) : (
                  <FormattedMessage defaultMessage={'Redemption Window Ends'} />
                )}
              </H5>
              <H4>
                {stakeNoteStatus?.redeemWindowBegin &&
                stakeNoteStatus?.inCoolDown
                  ? `${getDateString(stakeNoteStatus?.redeemWindowBegin, {
                      slashesFormat: true,
                    })} to `
                  : ''}
                {stakeNoteStatus?.redeemWindowEnd &&
                  getDateString(stakeNoteStatus?.redeemWindowEnd, {
                    showTime: true,
                    slashesFormat: true,
                  })}
              </H4>
            </Box>
            {stakeNoteStatus?.inCoolDown ? (
              <Button
                variant="contained"
                color="primary"
                size="large"
                to="/stake/ETH"
              >
                <FormattedMessage defaultMessage={'Cancel Cooldown'} />
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="large"
                to="/stake/ETH"
              >
                <FormattedMessage defaultMessage={'Redeem sNOTE'} />
              </Button>
            )}
          </InnerContainer>
        </Container>
      ) : (
        <TableActionRow row={row} />
      )}
    </Box>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
    background: ${theme.palette.background.default};
    width: 100%;
    display: flex;
    align-items: center;
    padding: ${theme.spacing(5, 11)};
        `
);

const InnerContainer = styled(Box)(
  `
    display: flex;
    justify-content: space-between;
    width: 100%;
        `
);

export default SNOTETableActionRow;
