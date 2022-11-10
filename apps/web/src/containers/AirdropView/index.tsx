import { Box, styled, TextField, useTheme } from '@mui/material'
import { Button, H1 } from '@notional-finance/mui'
import { useWallet } from '@notional-finance/notionable-hooks'
import { FormattedMessage } from 'react-intl'
import { updateAirdropState } from './airdrop-store'
import { useAirdrop } from './use-airdrop'

export const AirdropView = () => {
  const theme = useTheme()
  const { walletConnected } = useWallet()
  const { userClaimAmount, errorMsg, claimAirdrop, address } = useAirdrop()

  if (!walletConnected) {
    return (
      <AirdropContainer>
        <H1>Claim Your NOTE Airdrop</H1>
        <FormattedMessage defaultMessage="Connect a wallet to receive your airdrop" />
      </AirdropContainer>
    )
  }

  return (
    <AirdropContainer>
      <H1>Claim Your NOTE Airdrop</H1>
      <p>
        Enter an Ethereum address to claim your NOTE airdrop. Any Ethereum wallet can submit the claim, but the NOTE
        tokens will be only be transferred to the address entered. See the&nbsp;
        <a
          target="_blank"
          rel="noreferrer"
          href="https://docs.google.com/spreadsheets/u/2/d/1XdW2yX3sfixqfLTEXCrHwiV9jeWhtmPKaYCRq4dgvxU/edit?usp=sharing"
        >
          airdrop list here.
        </a>
        &nbsp;A second airdrop for LPs is also available through this site (if you are eligible for both you must have
        claimed the first airdrop). The list for the&nbsp;
        <a
          target="_blank"
          rel="noreferrer"
          href="https://docs.google.com/spreadsheets/d/19dmxlTBzcToFfKuwhVBi58fTeLOEV9C_APcnK4wbOQo/edit#gid=1635138429"
        >
          second airdrop is here.
        </a>
      </p>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'start',
          marginTop: theme.spacing(3),
          marginBottom: theme.spacing(3)
        }}
      >
        <TextField
          helperText={errorMsg}
          error={errorMsg !== ''}
          placeholder="Enter an address to claim"
          onChange={(event) => updateAirdropState({ address: event.target.value })}
          value={address}
          sx={{
            width: theme.spacing(50),
            marginRight: theme.spacing(2)
          }}
        />
        <Button disabled={errorMsg !== ''} className="claim-button" onClick={claimAirdrop} color="primary">
          CLAIM {userClaimAmount}
        </Button>
      </Box>
    </AirdropContainer>
  )
}

const AirdropContainer = styled(Box)(
  ({ theme }) => `
  margin-top: 60px;
  margin-left: 100px;
  width: 900px;

  h2 {
    margin-bottom: 36px;
  }

  a {
    color: ${theme.palette.primary.main};
  }
`
)

export default AirdropView
