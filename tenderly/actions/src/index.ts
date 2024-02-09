import { ActionFn, Context, Event, TransactionEvent } from '@tenderly/actions';
import { BigNumber, ethers } from 'ethers';
import { NotionalV3ABI } from '@notional-finance/contracts';

const url = 'https://data-service-dot-monitoring-agents.uc.r.appspot.com/events';

interface AccountContextUpdateInputs {
  account: string
}

interface TransferSingleInputs {
  operator: string,
  from: string,
  to: string,
  id: BigNumber,
  value: BigNumber
}

type DataServiceEvent = { name: string, params: { [key: string]: string } };

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
    ) as unknown as AccountContextUpdateInputs;

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
    ) as unknown as TransferSingleInputs;
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
        events
      })
    });
  }
};
