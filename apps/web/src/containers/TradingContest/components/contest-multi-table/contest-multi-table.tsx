import { Box, useTheme, styled } from '@mui/material';
import { CONTEST_TABLE_VARIANTS, ContestTable } from '@notional-finance/mui';
import { useCompactTables } from '../../hooks';
import { FormattedMessage } from 'react-intl';

export const ContestMultiTable = () => {
  const theme = useTheme();
  const { tableColumns, tableDataOne, tableDataTwo, tableDataThree } =
    useCompactTables();
  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: theme.spacing(10),
        marginBottom: theme.spacing(10),
      }}
    >
      <ContestTable
        data={tableDataOne}
        columns={tableColumns}
        tableVariant={CONTEST_TABLE_VARIANTS.COMPACT}
        tableTitle={<FormattedMessage defaultMessage={'HIGH ROLLER'} />}
        tableTitleSubText={
          <FormattedMessage
            defaultMessage={'Highest realized APY with leverage'}
          />
        }
      />
      <ContestTable
        data={tableDataTwo}
        columns={tableColumns}
        tableVariant={CONTEST_TABLE_VARIANTS.COMPACT}
        tableTitle={<FormattedMessage defaultMessage={'FAT CAT'} />}
        tableTitleSubText={
          <FormattedMessage
            defaultMessage={'Highest realized APY without leverage'}
          />
        }
      />
      <ContestTable
        data={tableDataThree}
        columns={tableColumns}
        tableVariant={CONTEST_TABLE_VARIANTS.COMPACT}
        tableTitle={<FormattedMessage defaultMessage={'SAD SACK'} />}
        tableTitleSubText={
          <FormattedMessage defaultMessage={'Lowest realized APY'} />
        }
      />
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: space-between;
    margin-top: ${theme.spacing(10)};
    margin-bottom: ${theme.spacing(10)};
    ${theme.breakpoints.down('md')} {
      flex-direction: column;
      align-items: center;
      gap: ${theme.spacing(10)};
    }
      `
);

export default ContestMultiTable;
