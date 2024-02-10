import { Box, styled, useTheme } from '@mui/material';
import {
  LabelValue,
  LargeInputTextEmphasized,
  LinkText,
} from '../typography/typography';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

interface ManageSideDrawerProps {
  heading: React.ReactNode;
  detailsTable: React.ReactNode;
  portfolioLink: string;
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
}: ManageSideDrawerProps) => {
  const theme = useTheme();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box>
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
        {optionSections.map(({ title, buttons }, i) =>
          buttons.length > 0 ? (
            <Box key={`section-${i}`}>
              {title && <Title>{title}</Title>}
              {buttons}
            </Box>
          ) : null
        )}
      </MainWrapper>
    </Box>
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
  `
);
