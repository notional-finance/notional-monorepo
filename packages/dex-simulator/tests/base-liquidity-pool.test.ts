import { RATE_PRECISION } from '@notional-finance/sdk/config/constants';
import {
  Network,
  TokenDefinition,
  TokenInterface,
  TokenRegistry,
  ExchangeRate,
} from '@notional-finance/token-balance';
import { BigNumber, ethers } from 'ethers';
import { MockPool } from './harness/MockPool';

describe('base liquidity pool unit tests', () => {
  const lpTokenDefinition: TokenDefinition = {
    address: 'test.eth',
    network: Network.Mainnet,
    symbol: 'TEST_LP',
    decimalPlaces: 18,
    tokenInterface: TokenInterface.ERC20,
  };

  TokenRegistry.registerToken(lpTokenDefinition);

  const balances = [
    TokenRegistry.makeBalance('1,000,000', 'USDC', Network.Mainnet),
    TokenRegistry.makeBalance('1,000,000', 'DAI', Network.Mainnet),
  ];

  const oracleRate: ExchangeRate = {
    base: 'USDC',
    quote: 'DAI',
    rate: BigNumber.from(RATE_PRECISION),
    validTimestamp: 0,
  };

  const mockPool = new MockPool(
    balances,
    oracleRate,
    TokenRegistry.makeBalance('1,000,000', 'TEST_LP', Network.Mainnet)
  );

  it('returns pro rata claims on lp tokens', () => {
    const claims = mockPool.getLPTokenClaims(
      TokenRegistry.makeBalance('1000', 'TEST_LP', Network.Mainnet)
    );
    expect(claims[0]).toEqTB(
      TokenRegistry.makeBalance('1000', 'USDC', Network.Mainnet)
    );
    expect(claims[1]).toEqTB(
      TokenRegistry.makeBalance('1000', 'DAI', Network.Mainnet)
    );
  });

  it('returns an oracle valuation of a balance array', () => {
    const USDCValue = mockPool.getBalanceArrayOracleValue(
      mockPool.balances,
      0,
      [mockPool.oracleRate, mockPool.oracleRate]
    );
    expect(USDCValue).toEqTB(
      TokenRegistry.makeBalance('2,000,000', 'USDC', Network.Mainnet)
    );
    const DAIValue = mockPool.getBalanceArrayOracleValue(mockPool.balances, 1, [
      mockPool.oracleRate,
      mockPool.oracleRate,
    ]);
    expect(DAIValue).toEqTB(
      TokenRegistry.makeBalance('2,000,000', 'DAI', Network.Mainnet)
    );
  });

  it('returns an oracle valuation of a single LP token', () => {
    const singleUSDCValue = mockPool.getLPTokenOracleValue(
      mockPool.totalSupply.copy(ethers.constants.WeiPerEther),
      0,
      [mockPool.oracleRate, mockPool.oracleRate]
    );

    const singleDAIValue = mockPool.getLPTokenOracleValue(
      mockPool.totalSupply.copy(ethers.constants.WeiPerEther),
      1,
      [mockPool.oracleRate, mockPool.oracleRate]
    );

    expect(singleUSDCValue).toEqTB(
      TokenRegistry.makeBalance('2', 'USDC', Network.Mainnet)
    );
    expect(singleDAIValue).toEqTB(
      TokenRegistry.makeBalance('2', 'DAI', Network.Mainnet)
    );
  });

  it('returns spot valuations of a single lp token', () => {
    const singleUSDCValue = mockPool.getLPTokenSpotValue(0);
    const singleDAIValue = mockPool.getLPTokenSpotValue(1);

    expect(singleUSDCValue).toEqTB(
      TokenRegistry.makeBalance('2', 'USDC', Network.Mainnet)
    );
    expect(singleDAIValue).toEqTB(
      TokenRegistry.makeBalance('2', 'DAI', Network.Mainnet)
    );
  });

  it('returns spot valuations of an array of balances', () => {
    const singleUSDCValue = mockPool.getBalanceArraySpotValue(
      mockPool.balances,
      0
    );
    const singleDAIValue = mockPool.getBalanceArraySpotValue(
      mockPool.balances,
      1
    );

    expect(singleUSDCValue).toEqTB(
      TokenRegistry.makeBalance('2,000,000', 'USDC', Network.Mainnet)
    );
    expect(singleDAIValue).toEqTB(
      TokenRegistry.makeBalance('2,000,000', 'DAI', Network.Mainnet)
    );
  });
});
