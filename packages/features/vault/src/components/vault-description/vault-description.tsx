import {
  H4,
  H5,
  PageLoading,
  Paragraph,
  TradeSummaryBox,
} from '@notional-finance/mui';
import { Box, styled, useTheme } from '@mui/material';
import { useVaultDocs } from '../../hooks';
import { ExternalLinkIcon } from '@notional-finance/icons';
import { messages } from '../../messages';

const HeadingContainer = styled(Box)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(1)};
`
);

const HeadingLinks = styled(Box)(
  ({ theme }) => `
  margin-top: ${theme.spacing(2)};
  align-items: baseline;
`
);

const ExternalLink = styled(ExternalLinkIcon)(
  ({ theme }) => `
  margin-left: ${theme.spacing(0.5)};
  font-size: ${theme.typography.h5.fontSize};
  fill: ${theme.palette.primary.light};
`
);

const SummaryContainer = styled(Box)(
  ({ theme }) => `
  border: ${theme.shape.borderStandard};
  border-radius: ${theme.shape.borderRadius()};
  background-color: ${theme.palette.background.default};
  padding-top: ${theme.spacing(3)};
  padding-left: ${theme.spacing(3)};
  padding-right: ${theme.spacing(3)};
`
);

export const VaultDescription = ({
  vaultAddress,
}: {
  vaultAddress: string;
}) => {
  const theme = useTheme();
  const { overviewContent, docsLink } = useVaultDocs(vaultAddress);

  return (
    <TradeSummaryBox>
      <HeadingContainer>
        <H4 gutter="default" msg={messages.summary.strategyOverviewHeading} />
        <HeadingLinks>
          {docsLink && (
            <Box marginBottom={theme.spacing(2)}>
              <H5
                accent
                inline
                uppercase
                href={docsLink}
                msg={messages.summary.strategyOverviewDocumentation}
              />
              <ExternalLink />
            </Box>
          )}
        </HeadingLinks>
      </HeadingContainer>
      {!overviewContent && <PageLoading />}
      {overviewContent && (
        <SummaryContainer>
          {overviewContent &&
            overviewContent.map(({ heading, paragraphs }, i) => {
              return (
                <Box key={`section-${i}`} marginBottom={theme.spacing(3)}>
                  <H5
                    gutter="default"
                    sx={{ color: theme.palette.typography.main }}
                  >
                    {heading}
                  </H5>
                  {paragraphs.map((c, j) => (
                    <Paragraph key={`s-${i}-${j}`}>{c}</Paragraph>
                  ))}
                </Box>
              );
            })}
        </SummaryContainer>
      )}
    </TradeSummaryBox>
  );
};

export default VaultDescription;
