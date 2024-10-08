import { Box, styled, useTheme } from '@mui/material';
import {
  LabelValue,
  LargeInputTextEmphasized,
  LinkText,
} from '../typography/typography';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import ErrorMessage from '../error-message/error-message';

export interface InfoMessageProps {
  variant: 'warning' | 'error' | 'info' | 'pending';
  title: React.ReactNode;
  message: React.ReactNode;
}
interface ManageSideDrawerProps {
  heading: React.ReactNode;
  detailsTable: React.ReactNode;
  portfolioLink: string;
  infoMessage?: InfoMessageProps;
  optionSections: {
    title?: React.ReactNode;
    buttons: React.ReactNode[];
  }[];
}

export const ManageSideDrawer = ({
  heading,
  detailsTable,
  portfolioLink,
  optionSections,
  infoMessage,
}: ManageSideDrawerProps) => {
  const theme = useTheme();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainWrapper>
      <TableWrapper>
        <LargeInputTextEmphasized
          gutter="default"
          sx={{ marginBottom: theme.spacing(5) }}
        >
          {heading}
        </LargeInputTextEmphasized>
        {detailsTable}
        <LinkText
          to={portfolioLink}
          sx={{
            marginTop: theme.spacing(1),
          }}
        >
          <FormattedMessage defaultMessage={'View in Portfolio'} />
        </LinkText>
      </TableWrapper>
      {infoMessage && (
        <Box sx={{ paddingBottom: theme.spacing(5) }}>
          <ErrorMessage
            variant={infoMessage.variant}
            title={infoMessage.title}
            message={infoMessage.message}
            maxWidth={'100%'}
            sx={{ marginTop: '0px' }}
          />
        </Box>
      )}
      {optionSections.map(({ title, buttons }, i) =>
        buttons.length > 0 ? (
          <Box key={`section-${i}`}>
            {title && <Title>{title}</Title>}
            {buttons}
          </Box>
        ) : null
      )}
    </MainWrapper>
  );
};

const TableWrapper = styled(Box)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(5)};
  ${theme.breakpoints.down('sm')} {
    margin-top: ${theme.spacing(5)};
  }
  `
);

const MainWrapper = styled(Box)(
  ({ theme }) => `
  ${theme.breakpoints.down('sm')} {
    display: flex;
    flex-direction: column-reverse;
  }
  `
);

const Title = styled(LabelValue)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(2.5)};
  margin-top: ${theme.spacing(5)};
  color: ${theme.palette.typography.light};
  font-weight: 700;
  text-transform: uppercase;
  ${theme.breakpoints.down('sm')} {
    margin-top: 0px;
  }
  `
);
