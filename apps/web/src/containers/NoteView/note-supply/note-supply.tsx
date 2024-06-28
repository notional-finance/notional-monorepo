import { Box, useTheme } from '@mui/material';
import {
  Caption,
  H2,
  H5,
  NoteChart,
  DateRangeButtons,
  ValidDateRanges,
} from '@notional-finance/mui';
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
import {
  NoteSupplyData,
  useUserSettings,
} from '@notional-finance/notionable-hooks';
import { useCallback, useEffect, useState } from 'react';

interface NoteSupplyProps {
  noteSupplyData: NoteSupplyData | undefined;
}

export const NoteSupply = ({ noteSupplyData }: NoteSupplyProps) => {
  const theme = useTheme();
  const { baseCurrency } = useUserSettings();
  const [dateRange, setDateRange] = useState(ValidDateRanges[2].value);
  const {
    noteHistoricalSupply,
    currentSupply,
    currentSupplyChange,
    annualEmissionRate,
  } = useNoteSupply(noteSupplyData, dateRange);
  const [supplyDisplayValue, setSupplyDisplayValue] = useState(0);

  const currentDateRange = ValidDateRanges.find(
    (range) => range.value === dateRange
  );

  useEffect(() => {
    if (currentSupply && supplyDisplayValue === 0) {
      setSupplyDisplayValue(currentSupply?.toFloat());
    }
  }, [currentSupply, supplyDisplayValue]);

  const noteNumCallback = useCallback((value: number) => {
    setSupplyDisplayValue(value);
  }, []);

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
      <ChartSectionContainer
        onMouseLeave={() => {
          if (currentSupply) {
            setSupplyDisplayValue(currentSupply?.toFloat());
          }
        }}
      >
        <NoteChart
          // option={option}
          // showMarkLines={true}
          noteNumCallback={noteNumCallback}
          data={noteHistoricalSupply}
          title={
            <FormattedMessage defaultMessage={'NOTE Circulating Supply'} />
          }
          largeValue={
            <DualColorValue value={supplyDisplayValue} suffix="NOTE" />
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
                dateRange={`(${currentDateRange?.displayValue})`}
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
      <DateRangeButtons setDateRange={setDateRange} dateRange={dateRange} />
    </ContentContainer>
  );
};

export default NoteSupply;
