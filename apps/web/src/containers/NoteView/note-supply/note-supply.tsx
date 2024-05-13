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
import { useNoteSupply } from './use-note-supply';
import { useFiat } from '@notional-finance/notionable-hooks';

export const NoteSupply = () => {
  const theme = useTheme();
  const baseCurrency = useFiat();
  const {
    noteHistoricalSupply,
    currentSupply,
    currentSupplyChange,
    annualEmissionRate,
  } = useNoteSupply();

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
          // showMarkLines={true}
          data={noteHistoricalSupply}
          title={
            <FormattedMessage defaultMessage={'NOTE Circulating Supply'} />
          }
          largeValue={
            // TODO: this should be a hover state instead of the currentSupply...
            <DualColorValue
              value={currentSupply?.toFloat() || 0}
              suffix="NOTE"
            />
          }
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
                <FormattedMessage defaultMessage={'Circulating Supply'} />
              </H5>
              <PercentAndDate
                percentChange={currentSupplyChange}
                dateRange="(30d)"
              />
            </Box>
            <Box>
              <H2>{currentSupply?.toDisplayString(0, false, false) || ''}</H2>
              <Caption>
                {currentSupply
                  ?.toFiat(baseCurrency)
                  .toDisplayStringWithSymbol(0, false, false) || ''}
              </Caption>
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
              <DualColorValue
                value={annualEmissionRate?.toFloat() || 0}
                suffix="/ yr"
              />
              <Caption>
                {annualEmissionRate
                  ?.toFiat(baseCurrency)
                  .toDisplayStringWithSymbol(0, false, false) || ''}
              </Caption>
            </Box>
          </ContentBox>
        </Box>
      </ChartSectionContainer>
    </ContentContainer>
  );
};

export default NoteSupply;
