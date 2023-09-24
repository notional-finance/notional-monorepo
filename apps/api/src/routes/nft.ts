import BetaPass from '../assets/BetaPass';
import { IRequest } from 'itty-router';
import { APIEnv } from '@notional-finance/durable-objects';

const NFT = {
  '0x965b3aad78cdab2cc778243b12705ba3b7c5048c': {
    default: {
      name: 'Notional ARB Beta [Deprecated]',
      description: 'Notional Arbitrum Beta contest pass.',
      image: BetaPass,
    },
  },
  '0x1BeaB4729Fc8C7B16Bc4D849f40aD81F9F563283': {
    default: {
      name: 'Notional Beta Contest Pass',
      description: 'Notional Arbitrum Beta contest pass.',
      image: BetaPass,
    },
  },
  '0x': {
    '0': {
      name: 'The Sad Sack',
      description: 'Sadly, leverage is not for you.',
      image:
        'https://assets.notional.finance/images/nft/ArbBetaPrizes/SadSack.png',
    },
    '1': {
      name: 'The Fat Cat',
      description: 'Ate well, slept soundly, made bank.',
      image:
        'https://assets.notional.finance/images/nft/ArbBetaPrizes/FatCat.png',
    },
    '2': {
      name: 'The High Roller',
      description: 'Put another Lambo in the stable.',
      image:
        'https://assets.notional.finance/images/nft/ArbBetaPrizes/HighRoller.png',
    },
  },
};

export const handleNFT = (request: IRequest, _env: APIEnv) => {
  const url = new URL(request.url);
  const [_, _nft, address, tokenId] = url.pathname.split('/');
  // Additional metadata standards can be found here:
  // https://docs.opensea.io/docs/metadata-standards
  if (NFT[address][tokenId]) {
    return new Response(JSON.stringify(NFT[address][tokenId]));
  } else if (NFT[address]['default']) {
    return new Response(JSON.stringify(NFT[address]['default']));
  }

  return new Response(JSON.stringify({ error: '404' }), { status: 404 });
};
