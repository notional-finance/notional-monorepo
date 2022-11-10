import { formatBigNumberToDecimals } from '@notional-finance/utils'
import { useAccount } from '@notional-finance/notionable-hooks'
import { BigNumber, ethers } from 'ethers'
import { useObservableState } from 'observable-hooks'
import { airdropState$, AIRDROP_ABI, claims$, initialAirdropState } from './airdrop-store'

export function useAirdrop() {
  const { account } = useAccount()
  const { address } = useObservableState(airdropState$, initialAirdropState)
  const isValidAddress = address ? ethers.utils.isAddress(address) : true
  const claims = useObservableState(claims$)
  let userClaimAmount = ''
  let errorMsg = ''
  const airdropContract =
    claims?.airdropAddress && account
      ? new ethers.Contract(claims.airdropAddress, AIRDROP_ABI, account.signer)
      : undefined
  const userClaims = claims?.userClaims
  const claimAddress = claims?.claimAddress

  if (!isValidAddress) {
    errorMsg = 'Invalid Address'
  } else if (!userClaims && address !== '') {
    errorMsg = 'Address has no airdrop claim'
  } else if (claims?.isClaimed === false) {
    errorMsg = 'Address has already claimed'
  } else if (userClaims?.amount) {
    const numString = formatBigNumberToDecimals(BigNumber.from(userClaims.amount), 8, 8)
    userClaimAmount = `(${numString} NOTE)`
  }

  const claimAirdrop = async () => {
    if (airdropContract && userClaims && claimAddress) {
      airdropContract.claim(userClaims.index, claimAddress, userClaims.amount, userClaims.proof)
    }
  }

  return {
    address,
    errorMsg,
    userClaimAmount,
    claimAirdrop
  }
}
