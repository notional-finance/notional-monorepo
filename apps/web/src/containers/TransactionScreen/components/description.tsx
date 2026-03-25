import { Box, styled, useTheme } from '@mui/material';
import { H4, SimpleToggle } from '@notional-finance/mui';
import {
  useAppStore,
  useVaultMetadata,
} from '@notional-finance/notionable-hooks';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import RichText from './rich-text';

export function Description({ vaultAddress }: { vaultAddress?: string }) {
  const theme = useTheme();
  const { isMobileView } = useAppStore();
  const [infoTab, setInfoTab] = useState(0);
  const vaultMetadata = useVaultMetadata(vaultAddress);

  return (
    <DescriptionContainer>
      {isMobileView ? (
        <MobileInfoStack>
          <MobileInfoSection>
            <H4>
              <FormattedMessage defaultMessage="Strategy Info" />
            </H4>
            <RichText
              clearPadding
              htmlInput={vaultMetadata?.vaultDescription || ''}
            />
          </MobileInfoSection>
          <MobileInfoSection>
            <H4>
              <FormattedMessage defaultMessage="Asset Info" />
            </H4>
            <RichText
              clearPadding
              htmlInput={
                vaultMetadata?.vaultAssets
                  .map(
                    (asset) =>
                      `<h1>${asset.name}</h1><div>${asset.description}</div>`
                  )
                  .join('<br />') || ''
              }
            />
          </MobileInfoSection>
          <MobileInfoSection>
            <H4>
              <FormattedMessage defaultMessage="Project Info" />
            </H4>
            <RichText
              clearPadding
              htmlInput={
                vaultMetadata?.projects
                  .map((project) => project.description)
                  .join('<br />') || ''
              }
            />
          </MobileInfoSection>
        </MobileInfoStack>
      ) : (
        <>
          <SimpleToggle
            selectedTabIndex={infoTab}
            tabVariant="standard"
            tabLabels={[
              <Box sx={{ padding: theme.spacing(0, 2) }} key="strategy-info">
                <FormattedMessage defaultMessage="Strategy Info" />
              </Box>,
              <Box sx={{ padding: theme.spacing(0, 2) }} key="asset-info">
                <FormattedMessage defaultMessage="Asset Info" />
              </Box>,
              <Box sx={{ padding: theme.spacing(0, 2) }} key="project-info">
                <FormattedMessage defaultMessage="Project Info" />
              </Box>,
            ]}
            onChange={(_, value) => {
              setInfoTab(value as number);
            }}
          />
          <Box sx={{ width: '100%', padding: theme.spacing(2) }}></Box>
          {infoTab === 0 && (
            <RichText htmlInput={vaultMetadata?.vaultDescription || ''} />
          )}
          {infoTab === 1 && (
            <RichText
              htmlInput={
                vaultMetadata?.vaultAssets
                  .map(
                    (asset) =>
                      `<h1>${asset.name}</h1><div>${asset.description}</div>`
                  )
                  .join('<br />') || ''
              }
            />
          )}
          {infoTab === 2 && (
            <RichText
              htmlInput={
                vaultMetadata?.projects
                  .map((project) => project.description)
                  .join('<br />') || ''
              }
            />
          )}
        </>
      )}
    </DescriptionContainer>
  );
}

const DescriptionContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  border: ${theme.shape.borderStandard};
  border-radius: ${theme.shape.borderRadius()};
  background: ${theme.palette.common.white};
  padding: ${theme.spacing(2)};
  padding-top: ${theme.spacing(3)};
  width: 100%;

  ${theme.breakpoints.down('sm')} {
    padding: ${theme.spacing(2)};
  }
`
);

const MobileInfoStack = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
`
);

const MobileInfoSection = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(1.5)};
`
);

export default Description;
