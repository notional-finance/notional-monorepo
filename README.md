

# Notional Finance Monorepo

This is the monorepo for all the Notional finance code. It is split into the following subpackages:

- `@notional-finance/contracts`: smart contract code and tests using [Buidler](https://buidler.dev).
- `@notional-finance/sdk`: A typescript based SDK that contains user centered logic for interacting with Notional contracts, including calculating rates off line. We will continue to expand and update this SDk as the underlying contracts evolve so that UIs have an abstraction layer to work with.
- `@notional-finance/subgraph`: [Graph Protocol Subgraph](https://thegraph.com) subgraph for caching contract interactions
- `@notional-finance/web`: Web frontend using React

## Getting Started

* You can learn more about the design of Notional from the [whitepaper](https://notional.finance/litepaper).

## Contract Details


## Developers

## Generate a React Application

Run `nx g @nx/react:app my-app` to generate an application.

When using Nx, you can create multiple applications and libraries in the same workspace.

## Generate libraries
### Grouped Library
Uses the following syntax
Run `nx g @nx/react:lib {features|common|shared}/lib-name --standaloneConfig --component false --buildable --import-path @notional-finance/lib-name` to generate a library.

### NPM Publishable Library
Run `nx g @nx/js:lib lib-name --standaloneConfig --component false --publishable --buildable --import-path @notional-finance/lib-name`

Libraries are shareable across libraries and applications. They can be imported from `@notional-finance/mylib`.

## Development server

Run `nx serve web` for a dev server. Navigate to http://localhost:3000/. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `nx g @nx/react:component my-component --project=my-app` to generate a new component.

## Build

Run `nx build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `nx test my-app` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

## Understand your workspace

Run `nx graph` to see a diagram of the dependencies of your projects.

## Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.



## ☁ Nx Cloud

### Distributed Computation Caching & Distributed Task Execution

<p style="text-align: center;"><img src="https://raw.githubusercontent.com/nx/nx/master/images/nx-cloud-card.png"></p>

Nx Cloud pairs with Nx in order to enable you to build and test code more rapidly, by up to 10 times. Even teams that are new to Nx can connect to Nx Cloud and start saving time instantly.

Teams using Nx gain the advantage of building full-stack applications with their preferred framework alongside Nx’s advanced code generation and project dependency graph, plus a unified experience for both frontend and backend developers.

Visit [Nx Cloud](https://nx.app/) to learn more.
