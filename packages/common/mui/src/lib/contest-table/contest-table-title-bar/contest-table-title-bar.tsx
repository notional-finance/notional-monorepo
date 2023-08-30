import { Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { CONTEST_TABLE_VARIANTS } from '../types';

interface ContestTableTitleBarProps {
  tableTitle: JSX.Element;
  tableTitleSubText?: JSX.Element;
  tableVariant?: CONTEST_TABLE_VARIANTS;
}

export const ContestTableTitleBar = ({
  tableTitle,
  tableTitleSubText,
  tableVariant = CONTEST_TABLE_VARIANTS.DEFAULT,
}: ContestTableTitleBarProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom:
          tableVariant === CONTEST_TABLE_VARIANTS.COMPACT ? '16px' : '-36px',
        '@media (max-width: 1152px)': {
          marginBottom: '16px',
        },
      }}
    >
      <Box>
        <TitleText>{tableTitle}</TitleText>
        <SubText>{tableTitleSubText}</SubText>
      </Box>
    </Box>
  );
};

const TitleText = styled(Box)(
  ({ theme }) => `
  color: ${colors.white};
  font-family: Avenir Next;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  padding-bottom: ${theme.spacing(1)};
      `
);
const SubText = styled(Box)(
  `
  color: ${colors.greenGrey};
  font-family: Avenir Next;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
      `
);

export default ContestTableTitleBar;
