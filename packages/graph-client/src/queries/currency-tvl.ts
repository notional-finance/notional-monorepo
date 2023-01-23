import { graphql } from '../../gql';
export default graphql(`
  query CurrencyTVLs($currencyId: String) {
    currencyTvls(
      where: { currency: $currencyId }
      first: 1
      orderBy: id
      orderDirection: desc
    ) {
      id
      usdValue
      underlyingValue
      currency {
        id
      }
    }
  }
`);
