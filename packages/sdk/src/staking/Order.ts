import { BigNumber, BigNumberish, constants, Signer, utils } from 'ethers';
import { BytesLike } from '@ethersproject/bytes';
import { ExchangeV3 } from '@notional-finance/contracts';

const assetProxyInterface = new utils.Interface([
  'function ERC20Token(address tokenAddress)',
]);

export default class Order {
  public takerAddress: string;

  public feeRecipientAddress: string;

  public senderAddress: string;

  public makerFee: BigNumberish;

  public takerFee: BigNumberish;

  public salt: BigNumberish;

  public makerAssetData: BytesLike;

  public takerAssetData: BytesLike;

  public makerFeeAssetData: BytesLike;

  public takerFeeAssetData: BytesLike;

  public expirationTimeSeconds: BigNumberish;

  constructor(
    public chainId: number,
    public makerAddress: string,
    salt: BigNumberish,
    expirationTimeSeconds: BigNumberish,
    makerTokenAddress: string,
    public wethAddress: string,
    public makerAssetAmount: BigNumberish,
    public takerAssetAmount: BigNumberish
  ) {
    this.takerAddress = constants.AddressZero;
    this.feeRecipientAddress = constants.AddressZero;
    this.senderAddress = constants.AddressZero;
    this.makerFee = BigNumber.from('0');
    this.takerFee = BigNumber.from('0');
    this.salt = salt;
    this.expirationTimeSeconds = expirationTimeSeconds;
    this.makerAssetData = assetProxyInterface.encodeFunctionData('ERC20Token', [
      makerTokenAddress,
    ]);
    this.takerAssetData = assetProxyInterface.encodeFunctionData('ERC20Token', [
      wethAddress,
    ]);
    this.makerFeeAssetData = assetProxyInterface.encodeFunctionData(
      'ERC20Token',
      [makerTokenAddress]
    );
    this.takerFeeAssetData = assetProxyInterface.encodeFunctionData(
      'ERC20Token',
      [wethAddress]
    );
  }

  public static fromAPIResponse(r: any) {
    return new Order(
      Number(r.chainId),
      r.makerAddress,
      BigNumber.from(r.salt),
      BigNumber.from(r.expirationTimeSeconds),
      assetProxyInterface.decodeFunctionData('ERC20Token', r.makerAssetData)[0],
      assetProxyInterface.decodeFunctionData('ERC20Token', r.takerAssetData)[0],
      BigNumber.from(r.makerAssetAmount),
      BigNumber.from(r.takerAssetAmount)
    );
  }

  public async hash(exchange: ExchangeV3) {
    const info = await exchange.callStatic.getOrderInfo(this);
    return info.orderHash;
  }

  public async sign(exchange: ExchangeV3, signer: Signer) {
    const hash = await this.hash(exchange);
    const signature = await signer.signMessage(utils.arrayify(hash));
    // Signature type 7 = wallet signature verification
    // https://github.com/0xProject/0x-protocol-specification/blob/master/v3/v3-specification.md#wallet
    if (signature.endsWith('1b') || signature.endsWith('1c')) {
      return `${signature}07`;
    }
    // Replace the final two bytes of the signature with 1c (28) so that it passes validation. Ledger wallets
    // other hardware wallets may not properly input the v parameter.
    return `${signature.substring(0, signature.length - 2)}1c07`;
  }
}
