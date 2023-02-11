/// <reference types="jest" />

declare namespace jest {
  interface Describe {
    withFork: (
      chainConfig: { blockNumber: number; network: string },
      name: string,
      fn?: ProvidesCallback,
      timeout?: number
    ) => void;
  }
}
