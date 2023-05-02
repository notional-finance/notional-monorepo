import { loadable } from '@notional-finance/mui';
import { colors } from '@notional-finance/styles';

export default loadable(() => import('./index'), colors.black);
