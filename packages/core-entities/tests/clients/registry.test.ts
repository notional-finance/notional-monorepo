import { Network, ZERO_ADDRESS } from '@notional-finance/util';
import fs from 'fs';
import crossFetch from 'cross-fetch';
import { Registry } from '../../src';
import httpserver from 'http-server';

const serveLocal = true;
const apiHostname = 'https://data-dev.notional.finance';
const cacheHostname = 'http://localhost:9999';
const server = httpserver.createServer({
  root: `${__dirname}/__snapshots__`,
});

describe('Snapshot', () => {
  beforeAll(async () => {
    Registry.initialize(serveLocal ? cacheHostname : apiHostname);

    if (serveLocal) {
      await new Promise<void>((resolve) => {
        server.listen(9999, () => {
          resolve();
        });
      });
      Registry.startRefresh(Network.ArbitrumOne);
    } else {
      const c = await crossFetch(
        Registry.getConfigurationRegistry().cacheURL(Network.ArbitrumOne)
      ).then((r) => r.text());

      const t = await crossFetch(
        Registry.getTokenRegistry().cacheURL(Network.ArbitrumOne)
      ).then((r) => r.text());

      const e = await crossFetch(
        Registry.getExchangeRegistry().cacheURL(Network.ArbitrumOne)
      ).then((r) => r.text());

      const o = await crossFetch(
        Registry.getOracleRegistry().cacheURL(Network.ArbitrumOne)
      ).then((r) => r.text());

      fs.writeFileSync(`${__dirname}/__snapshots__/configuration`, c);
      fs.writeFileSync(`${__dirname}/__snapshots__/tokens`, t);
      fs.writeFileSync(`${__dirname}/__snapshots__/exchanges`, e);
      fs.writeFileSync(`${__dirname}/__snapshots__/oracles`, o);
    }
  });

  it('[Configuration]', (done) => {
    const config = Registry.getConfigurationRegistry();
    config.onSubjectKeyReady(Network.ArbitrumOne, Network.ArbitrumOne, () => {
      expect(
        config.getLatestFromAllSubjects(Network.ArbitrumOne)
      ).toMatchSnapshot();
      done();
    });
  });

  // No exchanges listed yet
  it('[Exchanges]', (done) => {
    const exchanges = Registry.getExchangeRegistry();
    exchanges.onSubjectKeyReady(
      Network.ArbitrumOne,
      '0x06D45ef1f8b3C37b0de66f156B11F10b4837619A',
      () => {
        expect(
          exchanges.getLatestFromAllSubjects(Network.ArbitrumOne)
        ).toMatchSnapshot();
        done();
      }
    );
  });

  it('[Tokens]', (done) => {
    const config = Registry.getTokenRegistry();
    config.onSubjectKeyReady(Network.ArbitrumOne, ZERO_ADDRESS, () => {
      expect(
        config.getLatestFromAllSubjects(Network.ArbitrumOne)
      ).toMatchSnapshot();
      done();
    });
  });

  it('[Oracles]', (done) => {
    const config = Registry.getOracleRegistry();
    config.onSubjectKeyReady(
      Network.ArbitrumOne,
      '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8:0xc3882b132011ff3cea4da81f3303138368dd5d75:PrimeDebtToUnderlyingExchangeRate',
      () => {
        expect(
          config.getLatestFromAllSubjects(Network.ArbitrumOne, 0)
        ).toMatchSnapshot();
        done();
      }
    );
  });

  afterAll(() => {
    Registry.stopRefresh(Network.ArbitrumOne);
    server.close();
  });
});
