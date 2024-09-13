import { ActionFn, Context, Event, TransactionEvent } from '@tenderly/actions';
import { ethers } from 'ethers';
import NotionalV3ABI from '@notional-finance/contracts/src/abi/NotionalV3.json';
import { TransferSingleEventObject, TransferBatchEventObject, AccountContextUpdateEventObject, }
  from '@notional-finance/contracts/src/types/NotionalV3';
import fetch from 'node-fetch';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const url = 'https://us-central1-monitoring-agents.cloudfunctions.net/data-service/events';

type DataServiceAccountContextUpdate = {
  name: 'AccountContextUpdate',
  params: {
    account: string,
  }
};

type DataServiceTransferBatch = {
  name: 'TransferBatch',
  params: {
    operator: string,
    from: string,
    to: string,
    ids: string[],
    values: string[],
  }
};
type DataServiceTransferSingle = {
  name: 'TransferSingle',
  params: {
    operator: string,
    from: string,
    to: string,
    id: string,
    value: string,
  }
};

type DataServiceEvent = DataServiceTransferSingle | DataServiceTransferBatch | DataServiceAccountContextUpdate;

const parseEventsOfInterest = async (txEvent: TransactionEvent) => {
  const events: DataServiceEvent[] = [];
  const INotional = new ethers.utils.Interface(NotionalV3ABI);

  const accountContextUpdateTopic = INotional.getEventTopic('AccountContextUpdate');
  const accountContextUpdateLog = txEvent.logs.find(log => {
    return log.topics.find(topic => topic == accountContextUpdateTopic) !== undefined
  });

  if (accountContextUpdateLog) {
    const accountContextInputs = INotional.decodeEventLog(
      'AccountContextUpdate',
      accountContextUpdateLog.data,
      accountContextUpdateLog.topics,
    ) as unknown as AccountContextUpdateEventObject;

    events.push({
      name: 'AccountContextUpdate',
      params: {
        account: accountContextInputs.account
      }
    })
  }

  const transferSingleTopic = INotional.getEventTopic('TransferSingle');
  const transferSingleLog = txEvent.logs.find(log => {
    return log.topics.find(topic => topic == transferSingleTopic) !== undefined
  });

  if (transferSingleLog) {
    const transferSingleInputs = INotional.decodeEventLog(
      'TransferSingle',
      transferSingleLog.data,
      transferSingleLog.topics,
    ) as unknown as TransferSingleEventObject;
    if (transferSingleInputs.to !== ZERO_ADDRESS) {
      events.push({
        name: 'TransferSingle',
        params: {
          operator: transferSingleInputs.operator,
          from: transferSingleInputs.from,
          to: transferSingleInputs.to,
          id: transferSingleInputs.id.toString(),
          value: transferSingleInputs.value.toString()
        }
      })
    }
  }

  const transferBatchTopic = INotional.getEventTopic('TransferBatch');
  const transferBatchLog = txEvent.logs.find(log => {
    return log.topics.find(topic => topic == transferBatchTopic) !== undefined
  });


  if (transferBatchLog) {
    const transferBatchInputs = INotional.decodeEventLog(
      'TransferBatch',
      transferBatchLog.data,
      transferBatchLog.topics,
    ) as unknown as TransferBatchEventObject;
    if (transferBatchInputs.to !== ZERO_ADDRESS) {
      events.push({
        name: 'TransferBatch',
        params: {
          operator: transferBatchInputs.operator,
          from: transferBatchInputs.from,
          to: transferBatchInputs.to,
          ids: transferBatchInputs.ids.map(String),
          // strange issue with returned event object, if "values"
          // is accessed as property, function is returned instead of array
          // so we need to access it here as array element
          // @ts-ignore
          values: transferBatchInputs[4].map(String)
        }
      })
    }
  }

  return events;
};

export const accountsFn: ActionFn = async (
  context: Context,
  event: Event
) => {
  const dataServiceAuthToken = await context.secrets.get('DATA_SERVICE_AUTH_TOKEN');
  const txEvent = event as TransactionEvent;
  console.log('Processing events');
  const events = await parseEventsOfInterest(txEvent);

  console.log('Sending events');
  if (events.length) {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': dataServiceAuthToken
      },
      body: JSON.stringify({
        network: context.metadata.getNetwork(),
        events
      })
    });
  }
};
