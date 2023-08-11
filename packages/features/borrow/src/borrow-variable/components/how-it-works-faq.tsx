import { Body, ExternalLink, H5 } from '@notional-finance/mui';
import { ExternalLinkIcon } from '@notional-finance/icons';
import { Box, useTheme, styled } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export const HowItWorksFaq = () => {
  const theme = useTheme();

  return (
    <div>
      <Box
        sx={{
          background: theme.palette.background.default,
          padding: theme.spacing(3),
          border: theme.shape.borderStandard,
          borderRadius: theme.shape.borderRadius(),
        }}
      >
        <BodyText>
          <FormattedMessage
            defaultMessage={`The variable borrow rate on Notional is made up of two parts - the external lending rate and the prime borrow premium, which is a spread on top.`}
          />
        </BodyText>
        <BodyText>
          <FormattedMessage
            defaultMessage={`There are two parts to the borrow rate because unutilized assets in Notional’s variable lending market are lent out on external money markets to earn additional yield for lenders.`}
          />
        </BodyText>
        <BodyText>
          <FormattedMessage
            defaultMessage={`This means that the borrow rate is equal to the external lending rate + a premium based on the variable lending market’s utilization.`}
          />
        </BodyText>
        <H5
          sx={{
            color: theme.palette.typography.main,
            marginBottom: theme.spacing(2),
          }}
        >
          <FormattedMessage defaultMessage={`Calculating the borrow rate`} />
        </H5>
        <BodyText sx={{ fontWeight: 600 }}>
          <FormattedMessage
            defaultMessage={`Borrow rate = external lending rate + prime borrow premium`}
          />
        </BodyText>
        <BodyText sx={{ fontWeight: 600 }}>
          <FormattedMessage
            defaultMessage={`Prime borrow premium = borrow utilization factor * (1 + external lending rate)`}
          />
        </BodyText>
        <BodyText>
          <FormattedMessage
            defaultMessage={`For example, if the external lending rate is 2% and the borrow utilization factor is 3%, the borrow rate will be 5.06%:`}
          />
        </BodyText>
        <BodyText sx={{ fontWeight: 600 }}>
          <FormattedMessage
            defaultMessage={`Prime borrow premium = 3%* (1 + 2%) = 0.03 * 1.02 = 3.06%`}
          />
        </BodyText>
        <BodyText sx={{ fontWeight: 600, marginBottom: '0px' }}>
          <FormattedMessage
            defaultMessage={`Borrow rate = 2% + 3.06% = 5.06%`}
          />
        </BodyText>
      </Box>
      {/* TODO: ADD LINK TO DOCS */}
      <ExternalLink
        href=""
        textDecoration
        accent
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: theme.spacing(3),
        }}
      >
        <FormattedMessage
          defaultMessage={'Variable Rate Borrowing Documentation'}
        />
        <ExternalLinkIcon
          sx={{ fontSize: '12px', marginLeft: theme.spacing(0.5) }}
        />
      </ExternalLink>
    </div>
  );
};

const BodyText = styled(Body)(
  ({ theme }) => `
    margin-bottom: ${theme.spacing(2)};
  `
);

export default HowItWorksFaq;
