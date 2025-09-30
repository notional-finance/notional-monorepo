import { Box, styled, useTheme } from '@mui/material';
import { TradeActionButton } from '@notional-finance/trade';
import { observer } from 'mobx-react-lite';
import {
  useCurrentTradeContext,
  useTradeErrorMessage,
} from '@notional-finance/notionable-hooks';
import { SubmitModal } from '../modals/submit-modal';
import { ArrowIcon } from '@notional-finance/icons';
import { LabelValue } from '@notional-finance/mui';
import { Link } from 'react-router-dom';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

interface InputContainerProps {
  children: React.ReactNode | React.ReactNode[];
  hideSubmitButton?: boolean;
  submitText?: MessageDescriptor;
  hasBackButton?: boolean;
}

const InputContainer = observer(
  ({
    children,
    hasBackButton,
    submitText,
    hideSubmitButton = false,
  }: InputContainerProps) => {
    const theme = useTheme();
    const context = useCurrentTradeContext();
    const errorText = useTradeErrorMessage();

    return (
      <InputContainerWrapper>
        <Box
          sx={{
            width: '100%',
            gap: theme.spacing(5),
            justifyContent: 'space-between',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {hasBackButton && (
            <Link
              to={`/vault/${context?.selectedNetwork}/${context?.vaultAddress}`}
            >
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  marginBottom: theme.spacing(-3),
                }}
              >
                <ArrowIcon
                  sx={{
                    transform: 'rotate(-90deg)',
                    fontSize: theme.spacing(2),
                    marginRight: theme.spacing(1),
                    fill: theme.palette.typography.main,
                    color: theme.palette.typography.main,
                  }}
                />
                <LabelValue fontWeight="regular">
                  <FormattedMessage defaultMessage="Manage" />
                </LabelValue>
              </Box>
            </Link>
          )}
          {children}
        </Box>
        {hideSubmitButton === false && (
          <Box
            sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}
          >
            <TradeActionButton
              canSubmit={context?.canSubmit() ?? false}
              submitText={submitText}
              errorText={errorText}
              onSubmit={() => {
                // This triggers all of the approval and transaction logic
                context?.setConfirm(true);
              }}
            />
          </Box>
        )}
        <SubmitModal />
      </InputContainerWrapper>
    );
  }
);

const InputContainerWrapper = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  flex: 1;
  min-width: ${theme.spacing(88)};
  min-height: 100%;
  background-color: ${theme.palette.background.paper};
  padding: ${theme.spacing(3)};
  border: 1px solid ${theme.palette.borders.paper};
  border-radius: ${theme.shape.borderRadius()};
  `
);

export default InputContainer;
