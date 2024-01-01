import { ActionFn, Context, Event, BlockEvent } from '@tenderly/actions';

export const blockHelloWorldFn: ActionFn = async (
  _context: Context,
  event: Event
) => {
  const blockEvent = event as BlockEvent;
  console.log(blockEvent);
};
