import type { CodegenConfig } from '@graphql-codegen/cli';

// TODO: https://github.com/cult-of-coders/apollo-client-transformers

const config: CodegenConfig = {
  schema: './schemas/**/*.graphql',
  documents: ['queries/**/*.ts'],
  generates: {
    './queries/gql/': {
      preset: 'client',
      plugins: ['typescript'],
      config: {
        scalars: {
          BigDecimal: 'string',
          BigInt: 'string',
          Bytes: 'string',
        },
      },
    },
  },
};
export default config;
