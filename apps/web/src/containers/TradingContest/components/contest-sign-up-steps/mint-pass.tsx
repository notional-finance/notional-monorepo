import { useState } from 'react';
import { Box, useTheme, styled } from '@mui/material';
import { Input } from '@notional-finance/mui';
import {
  TitleText,
  ContestBodyText,
  StepContainer,
} from '../contest-shared-elements/contest-shared-elements';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { ContestButtonBar } from '../contest-button-bar/contest-button-bar';
import { useMintPass } from '../../hooks/use-mint-pass';

export const MintPass = ({
  isReadOnlyAddress,
  isWalletConnectedToNetwork,
  onMintPass,
  mintedAddress,
  setMintedAddress,
}: ReturnType<typeof useMintPass>) => {
  const theme = useTheme();
  const {
    globalState: { wallet },
  } = useNotionalContext();
  const [error, setError] = useState<boolean>(false);

  const handleMint = () => {
    if (isReadOnlyAddress || !isWalletConnectedToNetwork || !mintedAddress) {
      setError(true);
      return;
    }

    onMintPass();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const value = e?.target?.value;
    setMintedAddress(value);
    if (error === true) {
      setError(false);
    }
  };

  return (
    <StepContainer>
      <TitleText
        sx={{ marginBottom: theme.spacing(2), marginTop: theme.spacing(8) }}
      >
        <FormattedMessage defaultMessage="Mint Pass" />
        <ContestBodyText sx={{ marginTop: theme.spacing(3) }}>
          <FormattedMessage defaultMessage="Confirm the address you want to compete with and mint your entry pass. This can be a different address than the wallet you have connected." />
        </ContestBodyText>
      </TitleText>
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
            {error && (
              <FormattedMessage defaultMessage="Not a valid wallet address" />
            )}
          </Box>

          <MintInput
            placeholder={wallet?.selectedAddress || ''}
            handleChange={handleChange}
            inputValue={mintedAddress || ''}
            onKeyDown={(event) => (event.key === 'Enter' ? handleMint() : null)}
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
        buttonTwoText={<FormattedMessage defaultMessage={'Mint Entry Pass'} />}
        buttonTwoCallBack={() => handleMint()}
      />
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
