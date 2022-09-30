import { BigNumber, constants, ethers, utils } from 'ethers';
import { System } from '../../src/system';
import GraphClient from '../../src/data/GraphClient';
import TypedBigNumber, { BigNumberType } from '../../src/libs/TypedBigNumber';
import MockSystem from '../mocks/MockSystem';
import Notional from '../../src/Notional';
import { NoteERC20 } from '@notional-finance/contracts';
import { NOTE_CURRENCY_ID } from '../../src/config/constants';
import { Contracts } from '../../src/libs/types';

describe('Typed Big Number', () => {
  const provider = new ethers.providers.JsonRpcBatchProvider(
    'http://localhost:8545'
  );
  const system = new MockSystem();
  System.overrideSystem(system);
  MockSystem.overrideSystem(system);
  const notional = new Notional(
    {} as unknown as NoteERC20,
    {} as unknown as GraphClient,
    system,
    provider,
    {} as unknown as Contracts
  );
  afterAll(() => {
    system.destroy();
    expect(() => System.getSystem()).toThrowError('System not initialized');
  });

  it('does not allow arithmetic of two different types', () => {
    const t1 = TypedBigNumber.from(100, BigNumberType.ExternalAsset, 'DAI');
    const t2 = TypedBigNumber.from(
      100,
      BigNumberType.ExternalUnderlying,
      'DAI'
    );
    expect(() => {
      t1.add(t2);
    }).toThrowError(TypeError);
    expect(() => {
      t1.sub(t2);
    }).toThrowError(TypeError);
    expect(() => {
      t1.eq(t2);
    }).toThrowError(TypeError);
    expect(() => {
      t1.lt(t2);
    }).toThrowError(TypeError);
    expect(() => {
      t1.lte(t2);
    }).toThrowError(TypeError);
    expect(() => {
      t1.gt(t2);
    }).toThrowError(TypeError);
    expect(() => {
      t1.gte(t2);
    }).toThrowError(TypeError);
  });

  it('does not allow adding of two different currencies', () => {
    const t1 = TypedBigNumber.from(100, BigNumberType.ExternalAsset, 'cDAI');
    const t2 = TypedBigNumber.from(100, BigNumberType.ExternalAsset, 'cUSDC');
    expect(() => {
      t1.add(t2);
    }).toThrowError(TypeError);
    expect(() => {
      t1.sub(t2);
    }).toThrowError(TypeError);
    expect(() => {
      t1.eq(t2);
    }).toThrowError(TypeError);
    expect(() => {
      t1.lt(t2);
    }).toThrowError(TypeError);
    expect(() => {
      t1.lte(t2);
    }).toThrowError(TypeError);
    expect(() => {
      t1.gt(t2);
    }).toThrowError(TypeError);
    expect(() => {
      t1.gte(t2);
    }).toThrowError(TypeError);
  });

  it('converts to internal precision', () => {
    const ethInput = notional.parseInput('1.123456789', 'ETH', false)!;
    expect(ethInput.isExternalPrecision()).toBe(true);
    expect(ethInput.toInternalPrecision().toString()).toEqual(
      BigNumber.from(1.12345678e8).toString()
    );

    const usdcInput = TypedBigNumber.from(
      1.123456e6,
      BigNumberType.ExternalUnderlying,
      'USDC'
    );
    expect(usdcInput.toInternalPrecision().toString()).toEqual(
      BigNumber.from(1.123456e8).toString()
    );
  });

  it('converts to external precision', () => {
    const ethInput = notional.parseInput('1.12345678', 'ETH', true)!;
    expect(ethInput.isInternalPrecision()).toBe(true);
    expect(ethInput.toExternalPrecision().toString()).toEqual(
      utils.parseEther('1.12345678').toString()
    );
  });

  it('parses input strings', () => {
    const ethInput = notional.parseInput('1.1', 'ETH', true);
    expect(ethInput!.toString()).toEqual(BigNumber.from(1.1e8).toString());

    const ethInputExternal = notional.parseInput('1', 'ETH', false);
    expect(ethInputExternal!.toString()).toEqual(
      BigNumber.from(constants.WeiPerEther).toString()
    );

    const cETHInput = notional.parseInput('1.1', 'cETH', true);
    expect(cETHInput!.toString()).toEqual(BigNumber.from(1.1e8).toString());

    const usdcInput = notional.parseInput('1.1', 'USDC', false);
    expect(usdcInput!.toString()).toEqual(BigNumber.from(1.1e6).toString());

    const invalidInput = notional.parseInput('', 'cETH', true);
    expect(invalidInput).toBeUndefined();
  });

  it('converts internal assets to internal underlying', () => {
    const cDAI = notional.parseInput('50', 'cDAI', true)!;
    const DAI = cDAI?.toUnderlying();
    expect(DAI.symbol).toEqual('DAI');
    expect(DAI.toString()).toEqual(BigNumber.from(1e8).toString());
    expect(DAI.isUnderlying()).toBe(true);
    expect(DAI.isAssetCash()).toBe(false);
    expect(DAI.isInternalPrecision()).toBe(true);
    expect(DAI.isExternalPrecision()).toBe(false);
  });

  it('converts external assets to external underlying', () => {
    // this is parsed as external asset
    const cDAI = notional.parseInput('50', 'cDAI', false)!;
    const DAI = cDAI?.toUnderlying();
    expect(DAI.symbol).toEqual('DAI');
    expect(DAI.toString()).toEqual(utils.parseEther('1').toString());
    expect(DAI.isUnderlying()).toBe(true);
    expect(DAI.isAssetCash()).toBe(false);
    expect(DAI.isExternalPrecision()).toBe(true);
    expect(DAI.isInternalPrecision()).toBe(false);
  });

  it('converts internal underlying to internal asset', () => {
    const DAI = notional.parseInput('3', 'DAI', true)!;
    const cDAI = DAI.toAssetCash();
    expect(cDAI.symbol).toEqual('cDAI');
    expect(cDAI.toString()).toEqual(BigNumber.from(150e8).toString());
    expect(cDAI.isAssetCash()).toBe(true);
    expect(cDAI.isUnderlying()).toBe(false);
    expect(cDAI.isInternalPrecision()).toBe(true);
    expect(cDAI.isExternalPrecision()).toBe(false);
  });

  it('converts external underlying to external asset', () => {
    const DAI = notional.parseInput('3', 'DAI', false)!;
    const cDAI = DAI.toAssetCash();
    expect(cDAI.symbol).toEqual('cDAI');
    expect(cDAI.toString()).toEqual(BigNumber.from(150e8).toString());
    expect(cDAI.isAssetCash()).toBe(true);
    expect(cDAI.isUnderlying()).toBe(false);
    expect(cDAI.isInternalPrecision()).toBe(false);
    expect(cDAI.isExternalPrecision()).toBe(true);
  });

  it('converts to eth values without haircuts', () => {
    const ethValue = TypedBigNumber.from(
      1e8,
      BigNumberType.InternalUnderlying,
      'DAI'
    ).toETH(false);
    expect(ethValue.symbol).toEqual('ETH');
    expect(ethValue.toString()).toEqual(BigNumber.from(0.01e8).toString());

    const daiValue = TypedBigNumber.from(
      50e8,
      BigNumberType.InternalAsset,
      'cDAI'
    ).toETH(false);
    expect(daiValue.toString()).toEqual(BigNumber.from(0.01e8).toString());
  });

  it('converts to eth values with haircuts', () => {
    const daiValue = TypedBigNumber.from(
      1e8,
      BigNumberType.InternalUnderlying,
      'DAI'
    ).toETH(true);
    expect(daiValue.toString()).toEqual(BigNumber.from(0.0092e8).toString());

    const cDaiValue = TypedBigNumber.from(
      50e8,
      BigNumberType.InternalAsset,
      'cDAI'
    ).toETH(true);
    expect(cDaiValue.toString()).toEqual(BigNumber.from(0.0092e8).toString());
  });

  it('converts to eth values with buffers', () => {
    const ethValue = TypedBigNumber.from(
      -1e8,
      BigNumberType.InternalUnderlying,
      'DAI'
    ).toETH(true);
    expect(ethValue.toString()).toEqual(BigNumber.from(-0.0109e8).toString());
  });

  it('converts to NOTE to other currencies', () => {
    const noteTokens = TypedBigNumber.fromBalance(1e8, 'NOTE', true);
    expect(noteTokens.toUSD().toNumber()).toBe(1e8);
    expect(noteTokens.toETH(false).toString()).toEqual(
      BigNumber.from(0.01e8).toString()
    );
    expect(noteTokens.toETH(false).fromETH(3).toString()).toEqual(
      BigNumber.from(1e8).toString()
    );
  });

  it('converts to ETH to NOTE balances', () => {
    const ethTokens = TypedBigNumber.fromBalance(
      0.01e8,
      'ETH',
      true
    ).toExternalPrecision();
    // ETH is set to $100, so we should get 100 NOTE here at a 1-1 price
    expect(ethTokens.fromETH(NOTE_CURRENCY_ID, false).toString()).toEqual(
      BigNumber.from(1e8).toString()
    );
    expect(ethTokens.fromETH(NOTE_CURRENCY_ID, false).type).toEqual(
      BigNumberType.NOTE
    );
  });

  it('can build sNOTE balances', () => {
    const sNOTE = TypedBigNumber.fromBalance(100e8, 'sNOTE', false);
    expect(sNOTE.type).toBe(BigNumberType.sNOTE);
  });

  it('WETH balances are treated as ETH balances', () => {
    const weth = TypedBigNumber.fromBalance(100e8, 'WETH', false);
    const eth = TypedBigNumber.fromBalance(100e8, 'ETH', false);
    expect(weth.isWETH).toBe(true);
    expect(weth.symbol).toBe('ETH');
    expect(eth.add(weth).symbol).toBe('ETH');
  });

  it('properly restores WETH balances from JSON', () => {
    const weth = TypedBigNumber.fromBalance(100e8, 'WETH', false);
    const ser = weth.toJSON();
    expect(ser.symbol).toBe('WETH');
    const deser = TypedBigNumber.fromObject(ser);
    expect(deser.symbol).toBe('ETH');
    expect(deser.isWETH).toBe(true);
  });

  it('properly parses WETH balances', () => {
    const weth = notional.parseInput('1', 'WETH', false);
    expect(weth?.toExactString()).toBe('1.0');
    expect(weth?.isWETH).toBe(true);
  });

  it('properly parses sNOTE balances', () => {
    const snote = notional.parseInput('1', 'sNOTE', false);
    expect(snote?.toExactString()).toBe('1.0');
    expect(snote?.symbol).toBe('sNOTE');
  });

  it('properly converts NOTE and sNOTE balances to USD', () => {
    const note = notional.parseInput('1', 'NOTE', false);
    const snote = notional.parseInput('1', 'sNOTE', false);
    expect(note?.toUSD().toDisplayStringWithSymbol()).toBe('1.000 USD');
    expect(snote?.toUSD().toDisplayStringWithSymbol()).toBe('0.136 USD');
  });

  it('properly converts underlying and asset values for NonMintable tokens', () => {
    const nonMintable = notional.parseInput('1', 'NOMINT', false);
    expect(nonMintable?.isAssetCash()).toBeTruthy();
    expect(nonMintable?.toUnderlying().isUnderlying()).toBeTruthy();
    expect(nonMintable?.isExternalPrecision()).toBeTruthy();
    expect(
      nonMintable?.toInternalPrecision().toUnderlying(false).toString()
    ).toEqual(nonMintable?.toString());
    expect(nonMintable?.toUnderlying(false).toString()).toEqual(
      nonMintable?.toString()
    );
    expect(nonMintable?.toUnderlying(true).toExactString()).toEqual(
      nonMintable?.toInternalPrecision().toExactString()
    );

    expect(nonMintable?.toUnderlying().toAssetCash(false).toString()).toEqual(
      nonMintable?.toString()
    );
    expect(
      nonMintable?.toUnderlying().toAssetCash(true).toExactString()
    ).toEqual(nonMintable?.toInternalPrecision().toExactString());
  });

  it('converts values to USD and other foreign currencies', () => {
    const eth = notional.parseInput('1', 'ETH', false);
    let usdValue = eth?.toUSD();
    expect(usdValue?.toExactString()).toBe('100.0');
    expect(usdValue?.symbol).toBe('USD');
    expect(usdValue?.type).toBe(BigNumberType.Currency);

    const dai = notional.parseInput('1', 'DAI', false);
    usdValue = dai?.toCUR('USD');
    expect(usdValue?.toExactString()).toBe('1.0');
    expect(usdValue?.symbol).toBe('USD');
    expect(usdValue?.type).toBe(BigNumberType.Currency);
  });

  it('converts values to USD and other foreign currencies', () => {
    const eth = notional.parseInput('1', 'ETH', false);
    const jpyValue = eth?.toCUR('JPY');
    expect(jpyValue?.toExactString()).toBe('13718.06');
    expect(jpyValue?.symbol).toBe('JPY');
    expect(jpyValue?.type).toBe(BigNumberType.Currency);
  });

  it('toDisplayString', () => {
    const eth1 = notional.parseInput('-0.05', 'ETH', false);
    expect(eth1?.toDisplayString()).toBe('-0.050');

    const eth2 = notional.parseInput('-1.05', 'ETH', false);
    expect(eth2?.toDisplayString()).toBe('-1.050');

    const eth3 = notional.parseInput('1.05', 'ETH', false);
    expect(eth3?.toDisplayString()).toBe('1.050');

    const eth4 = notional.parseInput('0.05', 'ETH', false);
    expect(eth4?.toDisplayString()).toBe('0.050');

    const eth5 = notional.parseInput('-0.000', 'ETH', false);
    expect(eth5?.toDisplayString()).toBe('0.000');
  });

  it('toDisplayStringWithSymbol', () => {
    const eth1 = notional.parseInput('-0.05', 'ETH', true);
    expect(eth1?.toDisplayStringWithSymbol()).toBe('-0.050 ETH');
    expect(eth1?.toAssetCash(true).toDisplayStringWithSymbol()).toBe(
      '-2.500 cETH'
    );
  });

  it('toDisplayStringWithfCashSymbol', () => {
    const cETH = notional.parseInput('-0.05', 'cETH', true);
    const ETH = notional.parseInput('-0.05', 'ETH', true);
    expect(() => {
      cETH?.toDisplayStringWithfCashSymbol(3);
    }).toThrow();
    expect(ETH?.toDisplayStringWithfCashSymbol()).toBe('-0.050 fETH');
  });
});
