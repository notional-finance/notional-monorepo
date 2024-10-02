import { ActionFn, Context, Event, TransactionEvent } from '@tenderly/actions';
import { parseAccountsEvents } from './parseAccountsEvents';
import { parseReinvestmentEvents } from './parseReinvestEvents';
import {
  DataServiceEvent,
  DataServiceReinvestmentTrade,
  DataServiceEndpoints,
} from '@notional-finance/util';

const url =
  'https://us-central1-monitoring-agents.cloudfunctions.net/data-service';

async function sendEventsToDataService(
  context: Context,
  events: DataServiceEvent[] | DataServiceReinvestmentTrade[],
  endpoint: string
) {
  const dataServiceAuthToken = await context.secrets.get(
    'DATA_SERVICE_AUTH_TOKEN'
  );
  console.log('Sending events');
  if (events.length) {
    const res = await fetch(`${url}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': dataServiceAuthToken,
      },
      body: JSON.stringify({
        network: context.metadata.getNetwork(),
        events,
      }),
    });
    if (!res.ok) {
      throw new Error('Failed to send events to data service');
    }
  }
}

export const accountsFn: ActionFn = async (context: Context, event: Event) => {
  console.log('Processing events');
  const events = await parseAccountsEvents(event as TransactionEvent);

  await sendEventsToDataService(context, events, DataServiceEndpoints.EVENTS);
};

export const reinvestmentTradesFn: ActionFn = async (
  context: Context,
  event: Event
) => {
  console.log('Processing reinvestment events');
  const events = await parseReinvestmentEvents(
    context,
    event as TransactionEvent
  );

  await sendEventsToDataService(
    context,
    events,
    DataServiceEndpoints.REINVESTMENT_TRADES
  );
};
