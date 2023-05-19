import { Network, ZERO_ADDRESS } from '@notional-finance/util';
import { Registry, AccountFetchMode } from '../../src';

describe.withRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Snapshot',
  () => {
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
  }
);
