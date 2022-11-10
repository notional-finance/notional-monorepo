import { useTheme, Box, styled } from '@mui/material';
import { ArrowIcon } from '@notional-finance/icons';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

/* eslint-disable-next-line */
export interface SideBarSubHeaderProps {
  callback: (event?: MouseEvent | KeyboardEvent) => void;
  titleText?: MessageDescriptor;
}

const SubHeader = styled(Box)(
  ({ theme }) => `
  font-size: 20px;
  font-weight: 500;
  padding: ${theme.spacing(3)} 0px;
  margin-bottom: 40px;
  border-bottom: 1px solid ${theme.palette.borders.default};
  `
);

export function SideBarSubHeader({ callback, titleText }: SideBarSubHeaderProps) {
  const theme = useTheme();
  return (
    <SubHeader>
      <Box
        onClick={() => callback()}
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', paddingTop: '74px' }}
      >
        <ArrowIcon
          sx={{ transform: 'rotate(-90deg)', fill: theme.palette.typography.main }}
        ></ArrowIcon>
        <Box sx={{ marginLeft: theme.spacing(1), color: theme.palette.typography.main }}>
          <FormattedMessage {...titleText} />
        </Box>
      </Box>
    </SubHeader>
  );
}

export default SideBarSubHeader;
