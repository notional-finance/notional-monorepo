
import { TestRuntime, TestTransactionEvent, TestLog } from '@tenderly/actions-test';
import { accountsFn } from '../src/index';

//@ts-ignore
global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve('Ok')
}));


test("parse accounts events", async () => {
  const testRuntime = new TestRuntime();

  const transactionEvent = new TestTransactionEvent();
  const accountContextUpdateLog = new TestLog();
  accountContextUpdateLog.data = '0x';
  accountContextUpdateLog.topics = [
    '0x6bd4b121bca854a191536a2ca891155c42ee2fb23f307fb34e8bc65cfcb5412e',
    '0x000000000000000000000000bd73cf5baf12f120ee3f6c4ad82df9a12649e578'
  ];

  const randomLog = new TestLog();
  randomLog.data = '0x000000000000000000000000000000000000000000000000a5b40973915db19b';
  randomLog.topics = [
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    '0x000000000000000000000000129a44ac6ff0f965c907579f96f2ed682e52c84a',
    '0x0000000000000000000000000000000000000000000000000000000000000000'
  ];

  const transferSingleLog = new TestLog();
  randomLog.data = '0x000000000000000000000000000000000000000000000000000700666e2b0001000000000000000000000000000000000000000000000000000000003b54a3bb';
  randomLog.topics = [
    '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
    '0x00000000000000000000000022b908c2fea7a1e6043ffcdbc77d660d4d326961',
    '0x0000000000000000000000006f6603f12af215bdba1f55f643e098530dd45b8f',
    '0x0000000000000000000000003df035433cface65b6d68b77cc916085d020c8b8'
  ];

  transactionEvent.logs = [accountContextUpdateLog, randomLog, transferSingleLog];

  await testRuntime.execute(accountsFn, transactionEvent);

  expect(fetch).toHaveBeenCalledTimes(1);

  const expectedEvents = [{ "name": "AccountContextUpdate", "params": { "account": "0xBD73cF5baf12F120Ee3f6C4ad82df9a12649e578" } }, { "name": "TransferSingle", "params": { "operator": "0x22b908c2FeA7a1e6043FfcDBc77D660D4D326961", "from": "0x6F6603F12af215bDba1f55f643e098530DD45B8F", "to": "0x3Df035433cFACE65b6D68b77CC916085d020C8B8", "id": "1970764771950593", "value": "995402683" } }];
  expect(fetch).toHaveBeenCalledWith(expect.stringMatching('http*'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-auth-token': '' },
    body: JSON.stringify({ events: expectedEvents }),
  });
});
