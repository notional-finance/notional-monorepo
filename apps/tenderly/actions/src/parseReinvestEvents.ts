import TradingModuleABI from '@notional-finance/contracts/src/abi/TradingModule.json';
import TreasuryManagerABI from '@notional-finance/contracts/src/abi/TreasuryManager.json';
import { TradeExecutedEventObject } from '@notional-finance/contracts/src/types/TradingModule';
import { VaultRewardReinvestedEventObject } from '@notional-finance/contracts/src/types/TreasuryManager';
import {
  checkTradeLoss,
  DataServiceReinvestmentTrade,
  Network,
  NetworkId,
} from '@notional-finance/util';
import { Context, GatewayNetwork, TransactionEvent } from '@tenderly/actions';
import { Contract, ethers, utils, providers } from 'ethers';

const IERC20 = new ethers.utils.Interface([
  'function decimals() view external returns (uint8)',
]);

const getDecimals = (token: string, provider: providers.Provider) => {
  if (token == '0x0000000000000000000000000000000000000000') {
    return 18;
  }
  return new Contract(token, IERC20, provider).decimals();
};

export async function parseReinvestmentEvents(
  context: Context,
  txEvent: TransactionEvent
) {
  const network = context.metadata.getNetwork() as unknown as Network;
  const ITreasuryManager = new ethers.utils.Interface(TreasuryManagerABI);
  const reinvestedTopic = ITreasuryManager.getEventTopic(
    'VaultRewardReinvested'
  );
  const vaultRewardReinvestedLog = txEvent.logs.find((log) => {
    return log.topics.find((topic) => topic == reinvestedTopic) !== undefined;
  });

  if (!vaultRewardReinvestedLog) {
    throw new Error('No vault reward reinvested log found');
  }

  const vaultRewardReinvestedInputs = ITreasuryManager.decodeEventLog(
    'VaultRewardReinvested',
    vaultRewardReinvestedLog.data,
    vaultRewardReinvestedLog.topics
  ) as unknown as VaultRewardReinvestedEventObject;

  const ITradingModule = new ethers.utils.Interface(TradingModuleABI);
  const tradeExecutedTopic = ITradingModule.getEventTopic('TradeExecuted');
  const tradeExecutedLogs = txEvent.logs.filter((log) => {
    return (
      log.topics.find((topic) => topic == tradeExecutedTopic) !== undefined
    );
  });
  const gatewayURL = context.gateways.getGateway(
    network as unknown as GatewayNetwork
  );
  const provider = new ethers.providers.JsonRpcProvider(gatewayURL);
  const timestamp = await provider
    .getBlock(txEvent.blockNumber)
    .then((block) => block.timestamp);

  const events: DataServiceReinvestmentTrade[] = await Promise.all(
    tradeExecutedLogs.map(async (log) => {
      const tradeExecutedInputs = ITradingModule.decodeEventLog(
        'TradeExecuted',
        log.data,
        log.topics
      ) as unknown as TradeExecutedEventObject;
      const { lossPercentage, sellTokenPrice, buyTokenPrice, priceDecimals } =
        await checkTradeLoss(network, {
          sellToken: tradeExecutedInputs.sellToken,
          sellAmount: tradeExecutedInputs.sellAmount,
          buyToken: tradeExecutedInputs.buyToken,
          buyAmount: tradeExecutedInputs.buyAmount,
        });

      return {
        name: 'ReinvestmentTrade',
        params: {
          networkId: NetworkId[network],
          vaultAddress: vaultRewardReinvestedInputs.vault,
          txHash: txEvent.hash,
          sellToken: tradeExecutedInputs.sellToken,
          buyToken: tradeExecutedInputs.buyToken,
          sellAmount: utils.formatUnits(
            tradeExecutedInputs.sellAmount,
            await getDecimals(tradeExecutedInputs.sellToken, provider)
          ),
          buyAmount: utils.formatUnits(
            tradeExecutedInputs.buyAmount,
            await getDecimals(tradeExecutedInputs.buyToken, provider)
          ),
          timestamp,
          sellTokenPrice: utils.formatUnits(sellTokenPrice, priceDecimals),
          buyTokenPrice: utils.formatUnits(buyTokenPrice, priceDecimals),
          lossPercentage,
        },
      };
    })
  );

  return events;
}
