import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: './schemas/**/*.graphql',
  documents: ['src/queries/*.ts'],
  generates: {
    './gql/': {
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
