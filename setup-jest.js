import { tokenBalanceMatchers } from './packages/token-balance/src';
import hre from 'hardhat';

require('dotenv').config();

expect.extend(tokenBalanceMatchers);
console.log('inside setup jest');
describe.withFork = async ({ blockNumber, network }, name, fn, timeout) => {
  const jsonRpcUrl = `https://eth-${network}.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`;
  await hre.network.provider.request({
    method: 'hardhat_reset',
    params: [
      {
        forking: {
          jsonRpcUrl,
          blockNumber,
        },
      },
    ],
  });

  describe(name, fn, timeout);
};

console.log(describe);
