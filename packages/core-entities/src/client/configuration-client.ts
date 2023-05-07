import { ClientRegistry } from '../registry/client-registry';
import { AllConfigurationQuery } from '../.graphclient';
import { ConfigurationServer } from '../server/configuration-server';

export class ConfigurationClient extends ClientRegistry<AllConfigurationQuery> {
  protected cachePath = ConfigurationServer.CachePath

  // TODO: implement getters as required for convenience
}
