import { Box, styled, useTheme } from '@mui/material';
import { SectionTitle } from '../components';
import { FormattedMessage } from 'react-intl';
import {
  LinkText,
  CONTEST_TABLE_VARIANTS,
  ContestTable,
} from '@notional-finance/mui';
import { useYourPointsOverviewTables } from './hooks';
export const YourPointsOverview = () => {
  const theme = useTheme();
  const { yourPointsColumns, yourPointsData, overviewColumns, overviewData } =
    useYourPointsOverviewTables();

  return (
    <OuterContainer>
      <ContentContainer>
        <SectionTitle>
          <FormattedMessage defaultMessage={'Your Points'} />
        </SectionTitle>
        <ContestTable
          columns={yourPointsColumns}
          data={yourPointsData}
          tableLoading={false}
          tableVariant={CONTEST_TABLE_VARIANTS.ACCENT}
        />
        <LinkText to="/portfolio" sx={{ marginTop: theme.spacing(2) }}>
          <FormattedMessage defaultMessage={'Manage in Portfolio'} />
        </LinkText>
      </ContentContainer>
      <ContentContainer>
        <SectionTitle>
          <FormattedMessage defaultMessage={'Overview'} />
        </SectionTitle>
        <ContestTable
          columns={overviewColumns}
          data={overviewData}
          tableLoading={false}
          tableVariant={CONTEST_TABLE_VARIANTS.ACCENT}
        />
      </ContentContainer>
    </OuterContainer>
  );
};

const OuterContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: space-between;
    ${theme.breakpoints.down('md')} {
      flex-direction: column;
    }
      `
);

const ContentContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: column;
    ${theme.breakpoints.down('md')} {
      margin-bottom: ${theme.spacing(6)};
    }
      `
);

export default YourPointsOverview;
