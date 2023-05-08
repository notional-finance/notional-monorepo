import { ClientRegistry } from '../registry/client-registry';
import { AllConfigurationQuery } from '../.graphclient';
import { Routes } from '../server';

export class ConfigurationClient extends ClientRegistry<AllConfigurationQuery> {
  protected cachePath = Routes.Configuration

  // TODO: implement getters as required for convenience
}
