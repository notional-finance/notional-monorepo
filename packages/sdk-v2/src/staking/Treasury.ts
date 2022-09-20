import { BigNumber, BigNumberish, Contract, Signer } from 'ethers';
import { gql } from '@apollo/client/core';
import { fetch as crossFetch } from 'cross-fetch';
import { BigNumberType, TypedBigNumber } from '..';
import { System } from '../system';
import { populateTxnAndGas } from '../libs/utils';
import Order from './Order';

import { IAggregator } from '@notional-finance/contracts';
import StakedNote from './StakedNote';
import { DEFAULT_ORDER_EXPIRATION, RATE_PRECISION } from '../config/constants';

import IAggregatorABI from '.././abi/IAggregator.json';

const ORDER_URL = 'https://api.0x.org/sra/v3/orders';

const reserveQuery = gql`
  {
    cashGroups {
      currency {
        id
      }
      reserveBuffer
      reserveBalance
    }
    compbalance(id: "tvl:19090") {
      id
      value
    }
  }
`;

const compReserveQuery = gql`
  {
    tvlHistoricalDatas(orderBy: timestamp, orderDirection: desc, first: 1) {
      compBalance {
        value
        usdValue
      }
    }
  }
`;

interface CompQueryResult {
  tvlHistoricalDatas: {
    compBalance: {
      value: string;
      usdValue: string;
    };
  }[];
}

interface ReserveQueryResult {
  cashGroups: {
    currency: { id: string };
    reserveBuffer?: string;
    reserveBalance: string;
  }[];
  compbalance: {
    id: string;
    value: string;
  };
}

export default class Treasury {
  private static async populateTxnAndGas(msgSender: string, methodName: string, methodArgs: any[]) {
    const treasuryManager = System.getSystem().getTreasuryManager();
    return populateTxnAndGas(treasuryManager, msgSender, methodName, methodArgs);
  }

  public static async getManager() {
    const system = System.getSystem();
    const treasuryManager = system.getTreasuryManager();
    return treasuryManager.manager();
  }

  public static async getReserveData() {
    const system = System.getSystem();
    const treasuryManager = system.getTreasuryManager();
    const results = await system.graphClient.queryOrThrow<ReserveQueryResult>(reserveQuery);
    const reserveResults = await Promise.all(
      results.cashGroups.map(async (r) => {
        const currency = system.getCurrencyById(Number(r.currency.id));
        const underlyingSymbol = system.getUnderlyingSymbol(currency.id);
        const reserveBuffer = TypedBigNumber.fromBalance(
          r.reserveBuffer || 0,
          currency.assetSymbol,
          true
        ).toExternalPrecision();
        const reserveBalance = TypedBigNumber.fromBalance(
          r.reserveBalance,
          currency.assetSymbol,
          true
        ).toExternalPrecision();
        const b = await (currency.underlyingContract || currency.assetContract).balanceOf(treasuryManager.address);
        const treasuryBalance = TypedBigNumber.fromBalance(b, underlyingSymbol, false);

        return {
          symbol: underlyingSymbol,
          reserveBuffer,
          reserveBalance,
          treasuryBalance,
        };
      })
    );

    const noteReserve = await system
      .getNOTE()
      .balanceOf(treasuryManager.address)
      .then((b) => ({
        symbol: 'NOTE',
        reserveBuffer: TypedBigNumber.fromBalance(0, 'NOTE', false),
        reserveBalance: TypedBigNumber.fromBalance(0, 'NOTE', false),
        treasuryBalance: TypedBigNumber.fromBalance(b, 'NOTE', false),
      }));

    const wethReserve = await system
      .getWETH()
      .balanceOf(treasuryManager.address)
      .then((b) => ({
        symbol: 'WETH',
        reserveBuffer: TypedBigNumber.fromBalance(0, 'WETH', false),
        reserveBalance: TypedBigNumber.fromBalance(0, 'WETH', false),
        treasuryBalance: TypedBigNumber.fromBalance(b, 'WETH', false),
      }));

    reserveResults.push(noteReserve);
    reserveResults.push(wethReserve);
    return reserveResults;
  }

  public static async getCompData() {
    const system = System.getSystem();
    const treasuryManager = system.getTreasuryManager();
    const COMP = system.getCOMP();
    const compBalance = (await COMP?.balanceOf(treasuryManager.address)) || BigNumber.from(0);
    const results = await system.graphClient.queryOrThrow<CompQueryResult>(compReserveQuery);
    const reserveBalance = results.tvlHistoricalDatas.length
      ? BigNumber.from(results.tvlHistoricalDatas[0].compBalance.value)
      : BigNumber.from(0);
    const reserveValueUSD = results.tvlHistoricalDatas.length
      ? BigNumber.from(results.tvlHistoricalDatas[0].compBalance.usdValue)
      : BigNumber.from(0);

    return {
      symbol: 'COMP',
      reserveBuffer: BigNumber.from(0),
      reserveValueUSD,
      reserveBalance,
      treasuryBalance: compBalance,
    };
  }

  /** Manager Methods */
  public static async harvestAssetsFromNotional(currencyIds: number[]) {
    const manager = await Treasury.getManager();
    return Treasury.populateTxnAndGas(manager, 'harvestAssetsFromNotional', [currencyIds]);
  }

  public static async harvestCOMPFromNotional(currencyIds: number[]) {
    const system = System.getSystem();
    const manager = await Treasury.getManager();
    const cTokens = currencyIds.map((c) => system.getCurrencyById(c).assetContract.address);
    return Treasury.populateTxnAndGas(manager, 'harvestCOMPFromNotional', [cTokens]);
  }

  public static async getMaxNotePriceImpact() {
    const system = System.getSystem();
    const treasuryManager = system.getTreasuryManager();
    const purchaseLimit = await treasuryManager.notePurchaseLimit();
    // Purchase limit is 1e8 precision where 1e8 = 100%
    return (purchaseLimit.toNumber() / 1e8) * 100;
  }

  public static async investIntoStakedNOTE(noteAmount: TypedBigNumber, wethAmount: TypedBigNumber) {
    noteAmount.check(BigNumberType.NOTE, 'NOTE');
    wethAmount.check(BigNumberType.ExternalUnderlying, 'ETH');
    if (!wethAmount.isWETH) throw Error('Input is not WETH');

    const manager = await Treasury.getManager();
    const minBPT = StakedNote.getExpectedBPT(noteAmount, wethAmount)
      .mul((1 - 0.005) * RATE_PRECISION)
      .div(RATE_PRECISION);
    return Treasury.populateTxnAndGas(manager, 'investWETHAndNOTE', [wethAmount.n, noteAmount.n, minBPT]);
  }

  private static getMakerTokenAddress(symbol: string) {
    const address =
      symbol === 'COMP'
        ? System.getSystem().getCOMP()?.address
        : System.getSystem().getCurrencyBySymbol(symbol).underlyingContract?.address;

    if (!address) {
      throw new Error(`Invalid maker token ${symbol}`);
    }

    return address;
  }

  public static async getTradePriceData(symbol: string) {
    const system = System.getSystem();
    const makerTokenAddress = Treasury.getMakerTokenAddress(symbol);
    const treasuryManager = system.getTreasuryManager();
    const priceOracleAddress = await treasuryManager.priceOracles(makerTokenAddress);
    const slippageLimit = await treasuryManager.slippageLimits(makerTokenAddress);
    const priceOracle = new Contract(priceOracleAddress, IAggregatorABI, system.batchProvider) as IAggregator;
    const { answer } = await priceOracle.latestRoundData();
    const rateDecimals = await priceOracle.decimals();

    // rate * slippageLimit / slippageLimitPrecision (scale up to 10^18)
    const priceFloor = answer
      .mul(slippageLimit)
      .div(1e8)
      .mul(BigNumber.from(10).pow(18 - rateDecimals));
    return { priceFloor, spotPrice: answer };
  }

  public static async getOpenLimitOrders(skipFetchSetup = false) {
    const _fetch = skipFetchSetup ? fetch : crossFetch;
    const system = System.getSystem();
    const treasuryManager = system.getTreasuryManager();
    const ordersURL = `https://api.0x.org/sra/v3/orders?makerAddress=${treasuryManager.address}`;
    const response = await (await _fetch(ordersURL)).json();

    return response.data.records.map((r: any) => Order.fromAPIResponse(r.order));
  }

  public static async cancelOrder(order: Order) {
    const manager = await Treasury.getManager();
    return Treasury.populateTxnAndGas(manager, 'cancelOrder', [order]);
  }

  public static async submit0xLimitOrder(
    chainId: number,
    signer: Signer,
    symbol: string,
    makerAmount: BigNumberish,
    takerAmount: TypedBigNumber,
    skipFetchSetup = false
  ) {
    const _fetch = skipFetchSetup ? fetch : crossFetch;
    // takerTokenAddress is hardcoded to WETH
    if (!takerAmount.isWETH) throw Error('Taker amount is not WETH');
    // if (makerAmount.type !== BigNumberType.ExternalUnderlying) {
    //  throw Error('Maker amount is not external underlying');
    // }

    const system = System.getSystem();
    const makerTokenAddress = Treasury.getMakerTokenAddress(symbol);
    const exchange = system.getExchangeV3()?.connect(signer);
    if (!exchange) {
      throw new Error('Invalid exchange contract');
    }
    const timestamp = Math.floor(Date.now() / 1000);

    const order = new Order(
      chainId,
      system.getTreasuryManager().address,
      BigNumber.from(timestamp),
      BigNumber.from(timestamp + DEFAULT_ORDER_EXPIRATION),
      makerTokenAddress,
      system.getWETH().address,
      makerAmount,
      takerAmount.n
    );
    const signature = await order.sign(exchange, signer);
    return _fetch(ORDER_URL, {
      method: 'POST',
      body: JSON.stringify([
        {
          signature,
          senderAddress: order.senderAddress,
          makerAddress: order.makerAddress,
          takerAddress: order.takerAddress,
          makerFee: order.makerFee.toString(),
          takerFee: order.takerFee.toString(),
          makerAssetAmount: order.makerAssetAmount.toString(),
          takerAssetAmount: order.takerAssetAmount.toString(),
          makerAssetData: order.makerAssetData,
          takerAssetData: order.takerAssetData,
          salt: order.salt.toString(),
          exchangeAddress: exchange.address,
          feeRecipientAddress: order.feeRecipientAddress,
          expirationTimeSeconds: order.expirationTimeSeconds.toString(),
          makerFeeAssetData: order.makerFeeAssetData,
          chainId,
          takerFeeAssetData: order.takerFeeAssetData,
        },
      ]),
    });
  }
}
