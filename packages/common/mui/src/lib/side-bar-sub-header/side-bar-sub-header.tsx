import { useTheme, Box, styled, SxProps } from '@mui/material';
import { ArrowIcon } from '@notional-finance/icons';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { NotionalTheme } from '@notional-finance/styles';
import { H4 } from '../typography/typography';

 
export interface SideBarSubHeaderProps {
  callback: () => void;
  titleText?: MessageDescriptor;
  paddingTop?: string;
  sx?: SxProps;
}

interface ContainerProps {
  theme: NotionalTheme;
  paddingTop?: string;
}

export function SideBarSubHeader({
  callback,
  titleText,
  paddingTop,
  sx,
}: SideBarSubHeaderProps) {
  const theme = useTheme();
  return (
    <Container paddingTop={paddingTop} theme={theme} sx={{ ...sx }}>
      <ContentWrapper onClick={() => callback()}>
        <ArrowIcon
          sx={{
            transform: 'rotate(-90deg)',
            fill: theme.palette.typography.main,
          }}
        ></ArrowIcon>
        <H4
          sx={{
            marginLeft: theme.spacing(1),
            color: theme.palette.typography.main,
            fontWeight: theme.typography.fontWeightRegular,
          }}
        >
          <FormattedMessage {...titleText} />
        </H4>
      </ContentWrapper>
    </Container>
  );
}

const ContentWrapper = styled(Box)(
  ({ theme }) => `
  display: flex;
  align-items: center;
  cursor: pointer;
  ${theme.breakpoints.down('sm')} {
    padding-top: 0px;
  }
  `
);

const Container = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'paddingTop',
})(
  ({ theme, paddingTop }: ContainerProps) => `
  padding: ${theme.spacing(3)} 0px;
  margin-bottom: ${theme.spacing(2)};
  ${theme.breakpoints.down('sm')} {
    padding-top: ${paddingTop ? paddingTop : theme.spacing(3)};
  }
`
);

export default SideBarSubHeader;
