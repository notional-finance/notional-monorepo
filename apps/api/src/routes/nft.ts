import { APIEnv } from '..';
import BetaPass from '../assets/BetaPass';
import { IRequest } from 'itty-router';

const NFT = {
  '0x965b3aad78cdab2cc778243b12705ba3b7c5048c': {
    default: {
      name: 'Notional ARB Beta [Deprecated]',
      description: 'Notional Arbitrum Beta contest pass.',
      image: BetaPass,
    },
  },
  '0x7c2d3a5fa3b41f4e6e2086bb19372016a7533f3e': {
    default: {
      name: 'Notional Beta Contest Pass',
      description: 'Notional Arbitrum Beta contest pass.',
      image: BetaPass,
    },
  },
  '0xed8cbc13a2043d9c93115eeb3c9e4323e34659c3': {
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

export const handleNFT = (request: IRequest) => {
  const url = new URL(request.url);
  const [_, _nft, _address, tokenId] = url.pathname.split('/');
  const address = _address.toLowerCase();
  // Additional metadata standards can be found here:
  // https://docs.opensea.io/docs/metadata-standards
  if (NFT[address][tokenId]) {
    return new Response(JSON.stringify(NFT[address][tokenId]));
  } else if (NFT[address]['default']) {
    return new Response(JSON.stringify(NFT[address]['default']));
  }

  return new Response(JSON.stringify({ error: '404' }), { status: 404 });
};
