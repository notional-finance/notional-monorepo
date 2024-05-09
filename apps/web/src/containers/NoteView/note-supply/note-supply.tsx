import { Box, useTheme } from '@mui/material';
import { Caption, H2, H5, NoteChart } from '@notional-finance/mui';
import {
  ChartSectionContainer,
  ContentBox,
  NotePageSectionTitle,
  ContentContainer,
  PercentAndDate,
  DualColorValue,
  SubText,
} from '../components';
import { FormattedMessage } from 'react-intl';

export const NoteSupply = () => {
  const theme = useTheme();
  return (
    <ContentContainer id="note-supply">
      <NotePageSectionTitle
        title={<FormattedMessage defaultMessage={'NOTE Supply Schedule'} />}
        symbol="note"
      />
      <SubText>
        <FormattedMessage
          defaultMessage={
            'Monitor the impact of token unlocks and liquidity incentives on the circulating supply of NOTE.'
          }
        />
      </SubText>
      <ChartSectionContainer>
        <NoteChart
          // option={option}
          showMarkLines={true}
          title={
            <FormattedMessage defaultMessage={'NOTE Circulating Supply'} />
          }
          largeValue={<DualColorValue value={10_000_000} suffix="NOTE" />}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: theme.spacing(3),
          }}
        >
          <ContentBox
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                marginBottom: theme.spacing(2),
                justifyContent: 'space-between',
              }}
            >
              <H5>
                <FormattedMessage defaultMessage={'circulating supply'} />
              </H5>
              <PercentAndDate percentChange={3.26} dateRange="(30d)" />
            </Box>
            <Box>
              <H2>2,050,000</H2>
              <Caption>$1,000,000.00</Caption>
            </Box>
          </ContentBox>
          <ContentBox
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                marginBottom: theme.spacing(2),
                justifyContent: 'space-between',
              }}
            >
              <H5>
                <FormattedMessage defaultMessage={'annual emission rate'} />
              </H5>
            </Box>
            <Box>
              <DualColorValue value={500_000} suffix="/ yr" />
              <Caption>$100,000.00</Caption>
            </Box>
          </ContentBox>
        </Box>
      </ChartSectionContainer>
    </ContentContainer>
  );
};

export default NoteSupply;
