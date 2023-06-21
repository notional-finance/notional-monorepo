import { useTheme, Box, styled } from '@mui/material';
import { LabeledText, MiniButton, CountUp, Label } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { AngledArrowIcon } from '@notional-finance/icons';
import { messages } from '../messages';

export interface StakedNoteInfoBoxProps {
  noteSpotPriceUSD: number;
  notePriceDecimals?: number;
  noteModifiedPriceUSD?: number;
  // This field is only used for the treasury manager
  maxPriceImpact?: number;
  optimizeAction: () => void;
}

const StyledInfoBox = styled(Box)(
  ({ theme }) => `
  border-radius: ${theme.shape.borderRadiusLarge};
  background-color: ${theme.palette.background.default};
  padding: 1rem;
`
);

const StyledLabels = styled(Box)`
  display: flex;
  justify-content: space-between;
`;

const StyledLabel = styled(Box)`
  display: flex;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
`;

export const StakedNoteInfoBox = ({
  noteSpotPriceUSD,
  noteModifiedPriceUSD,
  optimizeAction,
  notePriceDecimals = 2,
  maxPriceImpact,
}: StakedNoteInfoBoxProps) => {
  const theme = useTheme();
  // This is the opposite label of what is selected
  const formattedNotePrice = (
    <CountUp
      value={noteModifiedPriceUSD || noteSpotPriceUSD}
      decimals={notePriceDecimals}
      prefix="$"
    />
  );
  const priceImpact = noteModifiedPriceUSD
    ? Math.abs(1 - noteModifiedPriceUSD / noteSpotPriceUSD) * 100
    : 0;
  const formattedPriceImpact = priceImpact ? (
    <CountUp value={priceImpact} decimals={3} suffix={'%'} />
  ) : (
    '0.000%'
  );

  const aboveMaxPriceImpactWarning =
    maxPriceImpact && priceImpact > maxPriceImpact ? 'Above Max' : null;

  const angledArrowProps = noteModifiedPriceUSD
    ? {
        visibility:
          noteModifiedPriceUSD !== noteSpotPriceUSD ? 'visible' : 'hidden',
        fill:
          noteModifiedPriceUSD > noteSpotPriceUSD
            ? theme.palette.primary.main
            : theme.palette.error.main,
        transform:
          noteModifiedPriceUSD > noteSpotPriceUSD ? 'rotate(180deg)' : 'unset',
      }
    : {
        visibility: 'hidden',
        fill: 'transparent',
        transform: 'unset',
      };

  return (
    <StyledInfoBox>
      <Label gutter="default">
        <FormattedMessage {...messages.stake.infoBoxHelptext} />
      </Label>
      <StyledLabels>
        <StyledLabel>
          <LabeledText
            label="NOTE Price"
            value={formattedNotePrice}
            sx={{ width: theme.spacing(16), textOverflow: 'ellipsis' }}
            labelAbove
          />
        </StyledLabel>
        <StyledLabel>
          <AngledArrowIcon
            sx={{
              ...angledArrowProps,
              alignSelf: 'flex-end',
              marginBottom: '0.1rem',
              marginRight: '0.25rem',
              width: '1rem',
              height: '1rem',
              transition: 'transform 0.3s linear 0s',
            }}
          />
          <LabeledText
            label="Price Impact"
            value={aboveMaxPriceImpactWarning || formattedPriceImpact}
            sx={{ width: theme.spacing(16), textOverflow: 'ellipsis' }}
            labelAbove
          />
        </StyledLabel>
        <StyledLabel sx={{ marginLeft: '1rem' }}>
          {/* TODO: sx properties are not working on mini button */}
          <MiniButton label={'Optimize'} isVisible onClick={optimizeAction} />
        </StyledLabel>
      </StyledLabels>
    </StyledInfoBox>
  );
};
