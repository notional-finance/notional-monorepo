import { getInRemoteStorage, logError } from '@notional-finance/helpers';
import { makeStore, system$ } from '@notional-finance/notionable';
import { ethers } from 'ethers';
import { combineLatest, filter, switchMap } from 'rxjs';

export interface AirdropFeatureState {
  address: string;
}

export const initialAirdropState = {
  address: '',
};

const {
  updateState: updateAirdropState,
  _state$: airdropState$,
  selectState: selectAirdropState,
} = makeStore<AirdropFeatureState>(initialAirdropState);

export { updateAirdropState, selectAirdropState, airdropState$ };

export const claims$ = combineLatest([
  selectAirdropState('address'),
  system$,
]).pipe(
  filter(([a, s]) => !!a && !!s),
  switchMap(async ([address, system]) => {
    if (system) {
      return await getActiveClaims(address, system.batchProvider);
    }
  })
);

const AIRDROP_FILE =
  'https://notional-airdrop.storage.googleapis.com/AirdropMerkleTree.json';
const INCENTIVE_FILE =
  'https://storage.googleapis.com/notional-airdrop/IncentiveAirdropTree.json';
const AIRDROP_ADDRESS = '0xa40aedAac28F9574124D7c8EFf59732cC77f1DD4';
const INCENTIVE_ADDRESS = '0x3728081Cc9668B206665cAE9Dc2B43Aff35aCc0c';

async function checkAirdropClaim(
  fileLocation: string,
  contractAddress: string,
  userAddress: string,
  provider: ethers.providers.Provider
) {
  const dataRaw = await getInRemoteStorage(fileLocation);
  const jsonParsed = JSON.parse(dataRaw);
  const userClaim = jsonParsed.claims[userAddress];

  let isClaimed = true;
  if (userClaim) {
    const airdropContract = new ethers.Contract(
      contractAddress,
      AIRDROP_ABI,
      provider
    );
    isClaimed = await airdropContract.isClaimed(userClaim.index);
  }

  return { isClaimed, userClaim };
}

async function getActiveClaims(
  userAddress: string,
  provider: ethers.providers.Provider
) {
  try {
    // Will return the checksummed address for comparison
    const userAddressParsed = ethers.utils.getAddress(userAddress);

    const { isClaimed: isOriginalClaimed, userClaim: originalClaim } =
      await checkAirdropClaim(
        AIRDROP_FILE,
        AIRDROP_ADDRESS,
        userAddressParsed,
        provider
      );

    if (originalClaim && !isOriginalClaimed) {
      // If the original airdrop is not claimed, then show it first.
      return {
        airdropAddress: AIRDROP_ADDRESS,
        claimAddress: userAddress,
        userClaims: originalClaim,
        isClaimed: isOriginalClaimed,
      };
    } else {
      // Otherwise check if there is an incentive claim
      const { isClaimed: isIncentiveClaimed, userClaim: incentiveClaim } =
        await checkAirdropClaim(
          INCENTIVE_FILE,
          INCENTIVE_ADDRESS,
          userAddressParsed,
          provider
        );

      if (incentiveClaim && !isIncentiveClaimed) {
        return {
          airdropAddress: INCENTIVE_ADDRESS,
          claimAddress: userAddress,
          userClaims: incentiveClaim,
          isClaimed: isIncentiveClaimed,
        };
      }
    }
  } catch (error) {
    logError(error as Error, 'sagas-airdrop', 'getAirdropData');

    return {
      claimAddress: '',
      userClaims: undefined,
      isClaimed: true,
      error: (error as any).msg,
    };
  }
}

export const AIRDROP_ABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'bytes32[]',
        name: 'merkleProof',
        type: 'bytes32[]',
      },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'isClaimed',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
