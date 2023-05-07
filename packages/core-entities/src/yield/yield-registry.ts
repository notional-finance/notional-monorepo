/**
 * Yield on a token can come from a few sources:
 *
 * Variable lending interest which is monotonically increasing. In this case
 * the exchange rate can be normalized to an underlying scalar and the underlying
 * scalar can be compared across any two time points.
 *
 * Incentive token emission rates can also be modeled in the same way, there is some
 * amount of incentive tokens accrued to a token which is monotonically increasing. The
 * amount of incentive tokens accrued over a period is the ratio of the scalars. In
 * both of these versions, the exchange rate will change on mints and burns.
 *
 * Trading fees can also be accrued, not on mints and burns but swaps. Trading fees cannot
 * be modeled as a monotonically increasing because the value of the two sides of the LP token
 * will also change. Trading fees can be modeled as the sum of fees accrued over a period of time
 * in both tokens. Also, trading fees are often not explicitly tracked. They are recorded on each
 * swap event, so direct block chain calls cannot capture trading fees.
 * TODO: maybe scan dune api for this
 *
 * In the end, unless we use event tracking to update these numbers, they will only inspect the
 * blockchain at defined time intervals.
 */
