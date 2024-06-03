import {
  Banner,
  DataTable,
  LargeInputTextEmphasized,
} from '@notional-finance/mui';
import {
  TableActionRow,
  EmptyPortfolio,
  SNOTETableActionRow,
} from '../../components';
import { FormattedMessage, defineMessage, defineMessages } from 'react-intl';
import { usePortfolioSNOTETable, usePortfolioNOTETable } from '../../hooks';
import { Box, useTheme, styled } from '@mui/material';
import { formatNumberAsPercent, lastValue } from '@notional-finance/util';
import { useStakedNoteData } from '@notional-finance/notionable-hooks';

export const PortfolioNoteStaking = () => {
  const theme = useTheme();
  const { columns, data, initialState, setExpandedRows, noStakedNoteData } =
    usePortfolioSNOTETable();
  const { noteColumns, noteData, initialNoteState } = usePortfolioNOTETable();
  const stakedNoteData = useStakedNoteData();
  const currentSNOTEYield = stakedNoteData
    ? lastValue(stakedNoteData)?.apy || 0
    : 0;

  const stakedNoteBanner = {
    title: defineMessage({
      defaultMessage: 'Stake Your NOTE',
      description: 'empty note staking overview title',
    }),
    messages: defineMessages({
      promptText: {
        defaultMessage:
          'NOTE stakers provide liquidity for NOTE on Balancer and earn yield from reinvestments.',
        description: 'empty note staking overview prompt text',
      },
      buttonText: {
        defaultMessage: 'Stake and Earn',
        description: 'empty note staking button text',
      },
    }),
  };

  return (
    <Box>
      {noStakedNoteData && noteData.length === 0 && <EmptyPortfolio />}
      {noStakedNoteData && noteData.length > 0 && (
        <Box sx={{ marginBottom: theme.spacing(3) }}>
          <Banner
            messages={stakedNoteBanner.messages}
            buttonSuffix={` ${formatNumberAsPercent(currentSNOTEYield)} APY`}
            tokenSymbol="sNOTE"
            title={stakedNoteBanner.title}
            link="/stake/ETH"
          />
        </Box>
      )}
      <Heading sx={{ marginBottom: theme.spacing(3) }}>
        <FormattedMessage
          defaultMessage="NOTE Staking"
          description="table title"
        />
      </Heading>
      {!noStakedNoteData && (
        <DataTable
          data={data}
          columns={columns}
          CustomRowComponent={SNOTETableActionRow}
          expandableTable={true}
          tableTitle={
            <FormattedMessage
              defaultMessage="sNOTE Holdings"
              description="table title"
            />
          }
          initialState={initialState}
          setExpandedRows={setExpandedRows}
        />
      )}
      {noteData.length > 0 && (
        <DataTable
          data={noteData}
          columns={noteColumns}
          CustomRowComponent={TableActionRow}
          expandableTable={true}
          tableTitle={
            <FormattedMessage
              defaultMessage="NOTE Holdings"
              description="table title"
            />
          }
          initialState={initialNoteState}
          setExpandedRows={setExpandedRows}
        />
      )}
    </Box>
  );
};

const Heading = styled(LargeInputTextEmphasized)(
  ({ theme }) => `
  ${theme.breakpoints.down('sm')} {
    display: none;
  };`
);

export default PortfolioNoteStaking;
