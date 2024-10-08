import { useEffect, useState } from 'react';
import { Box, useTheme, styled } from '@mui/material';
import { Input, ProgressIndicator } from '@notional-finance/mui';
import {
  TitleText,
  ContestBodyText,
  StepContainer,
} from '../contest-shared-elements';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { ethers } from 'ethers';
import {
  useNotionalContext,
  useMintPass,
} from '@notional-finance/notionable-hooks';
import { ContestButtonBar } from '../contest-button-bar';
import { useChangeNetwork } from '@notional-finance/trade';
import { Network } from '@notional-finance/util';

export const MintPass = ({
  isReadOnlyAddress,
  isWalletConnectedToNetwork,
  onMintPass,
  mintedAddress,
  setMintedAddress,
  transactionStatus,
  errorMessage,
}: ReturnType<typeof useMintPass>) => {
  const theme = useTheme();
  const {
    globalState: { wallet },
  } = useNotionalContext();
  const [error, setError] = useState<string>('');
  const { changeNetwork: onSwitchNetwork } = useChangeNetwork(undefined);

  useEffect(() => {
    if (errorMessage) {
      setError(errorMessage);
    }
  }, [errorMessage]);

  const handleMint = () => {
    if (
      isReadOnlyAddress ||
      !mintedAddress ||
      !ethers.utils.isAddress(mintedAddress)
    ) {
      setError('Invalid address');
    } else {
      onMintPass();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const value = e?.target?.value;
    setMintedAddress(value);
    if (error.length > 0) {
      setError('');
    }
  };

  return (
    <StepContainer>
      <TitleText
        sx={{ marginBottom: theme.spacing(2), marginTop: theme.spacing(8) }}
      >
        <FormattedMessage defaultMessage="Mint Pass" />
        <ContestBodyText sx={{ marginTop: theme.spacing(3) }}>
          {transactionStatus === 'wait-user-confirm' ||
          transactionStatus === 'submitted' ? (
            <FormattedMessage defaultMessage="Confirm transaction in wallet" />
          ) : (
            <FormattedMessage defaultMessage="Confirm the address you want to compete with and mint your entry pass. This can be a different address than the wallet you have connected." />
          )}
        </ContestBodyText>
      </TitleText>
      {transactionStatus === 'wait-user-confirm' ||
      transactionStatus === 'submitted' ? (
        <ProgressIndicator type="notional" />
      ) : (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: theme.spacing(7),
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'baseline',
                justifyContent: 'center',
              }}
            >
              <Box
                component="span"
                sx={{
                  color: error ? theme.palette.error.main : 'transparent',
                  fontSize: '12px',
                  minHeight: theme.spacing(2),
                }}
              >
                {error}
              </Box>

              <MintInput
                placeholder={wallet?.selectedAddress || ''}
                handleChange={handleChange}
                inputValue={mintedAddress || ''}
                onKeyDown={(event) =>
                  event.key === 'Enter' ? handleMint() : null
                }
                sx={{
                  marginTop: theme.spacing(1),
                  paddingLeft: theme.spacing(1),
                  paddingRight: theme.spacing(1),
                  borderColor: error ? theme.palette.error.main : '',
                  backgroundColor: colors.black,
                  borderRadius: theme.shape.borderRadius(),
                  width: theme.spacing(54),
                  height: theme.spacing(7),
                }}
              />
            </Box>
          </Box>

          <ContestButtonBar
            buttonOneText={<FormattedMessage defaultMessage={'Back'} />}
            buttonOnePathTo="community-partners"
            buttonTwoText={
              isWalletConnectedToNetwork ? (
                <FormattedMessage defaultMessage={'Mint Entry Pass'} />
              ) : (
                <FormattedMessage defaultMessage={'Switch to Arbitrum'} />
              )
            }
            buttonTwoCallBack={() =>
              isWalletConnectedToNetwork
                ? handleMint()
                : onSwitchNetwork(Network.arbitrum)
            }
          />
        </>
      )}
    </StepContainer>
  );
};

const MintInput = styled(Input)(
  ({ theme }) => `
      ${theme.breakpoints.down('sm')} {
        width: ${theme.spacing(41.25)};
      }
      `
);

export default MintPass;
