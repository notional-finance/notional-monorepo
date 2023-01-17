import { styled, Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { TransactionStatus } from './transaction-status';
import transactionSuccessSvg from '../../icons/icon-checkmark.svg';
import transactionErrorSvg from '../../icons/icon-alert.svg';
import {
  ProgressIndicator,
  LargeInputTextEmphasized,
} from '@notional-finance/mui';

const Heading = styled(LargeInputTextEmphasized)`
  margin-bottom: 1.25rem;
`;

const StatusIcon = styled(Box)`
  margin-bottom: 1rem;
  width: 4rem;
  height: 4rem;
`;
interface StatusHeadingProps {
  heading: React.ReactNode;
  transactionStatus: TransactionStatus;
}

export const StatusHeading = ({
  heading,
  transactionStatus,
}: StatusHeadingProps) => {
  let statusIcon;
  let headingText;

  switch (transactionStatus) {
    case TransactionStatus.PENDING:
      statusIcon = <ProgressIndicator type="notional" width="75" />;
      headingText = (
        <>
          <FormattedMessage defaultMessage={'Pending'} />
          &nbsp;{heading}
        </>
      );
      break;
    case TransactionStatus.CONFIRMED:
      statusIcon = (
        <img
          className="status-icon"
          src={transactionSuccessSvg}
          alt="Success"
        />
      );
      headingText = (
        <FormattedMessage defaultMessage={'Success! Transaction submitted.'} />
      );
      break;
    case TransactionStatus.REVERT:
    case TransactionStatus.ERROR_BUILDING:
      statusIcon = (
        <img
          className="status-icon"
          src={transactionErrorSvg}
          alt="Exclamation point"
        />
      );
      headingText = <FormattedMessage defaultMessage={'Error'} />;
      break;
    default:
      statusIcon = (
        <img
          className="status-icon"
          src={transactionSuccessSvg}
          style={{ opacity: '25%' }}
          alt="Success"
        />
      );
      headingText = (
        <>
          <FormattedMessage defaultMessage={'Confirm'} />
          &nbsp;{heading}
        </>
      );
      break;
  }

  return (
    <Box>
      <StatusIcon>{statusIcon}</StatusIcon>
      <Heading>{headingText}</Heading>
    </Box>
  );
};
