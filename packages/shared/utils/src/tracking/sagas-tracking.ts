// import { constants } from '../lib/constants';
// import { takeEvery, select, debounce, takeLatest, put } from 'redux-saga/effects';
// import {
//   initGA,
//   trackEvent,
//   trackImpactEmailSubscribe,
//   trackImpactTxnSubmit,
//   trackImpactWalletConnect,
// } from '@notional-finance/utils';
// import {
//   selectHasAnalyticsInit,
//   selectHasConsent,
//   selectImpactClickId,
//   trackingActions,
// } from '../slices/tracking.slice';
// import { selectAccountAddress } from '../selectors/wallet.selectors';

// export function* handleSetConsent(action) {
//   const { payload: hasConsent } = action;
//   const hasAnalyticsInit = yield select(selectHasAnalyticsInit);

//   if (hasConsent && !hasAnalyticsInit) {
//     initGA();
//     yield put(trackingActions.setAnalyticsInit(true));
//   }
// }

// export function* trackSingleEvent(action) {
//   const { type } = action;
//   // Defer has consent check because GA will buffer events in the browser and submit them
//   // if the user consents later in the session
//   const hasConsent = yield select(selectHasConsent);
//   const impactClickId = yield select(selectImpactClickId);
//   const accountAddress = yield select(selectAccountAddress);

//   switch (type) {
//     case constants.SUBSCRIBE_EMAIL: {
//       trackEvent('EMAIL', 'SIGNUP', '', undefined, false);
//       trackImpactEmailSubscribe(impactClickId, hasConsent, accountAddress);
//       break;
//     }

//     case constants.SET_WALLET:
//     case constants.SET_PRESELECTED_WALLET: {
//       trackEvent('WALLET', type, '');
//       trackImpactWalletConnect(impactClickId, accountAddress, hasConsent);
//       break;
//     }

//     case constants.GET_SELECTED_ASSET_MARKET:
//     case constants.GET_SELECTED_MARKET: {
//       const { marketKey } = action;
//       trackEvent('MARKET', type, marketKey);
//       break;
//     }

//     case constants.SUBMIT_SET_ALLOWANCE: {
//       const { symbol, allowance } = action;
//       const value = allowance.isZero() ? 0 : 1;
//       trackEvent('TXN', type, symbol, value);
//       break;
//     }

//     case constants.SUBMIT_TRANSACTION: {
//       const { tradeAction } = yield select((state) => state.currency);
//       trackEvent('TXN', type, tradeAction);
//       break;
//     }

//     case constants.SUBMIT_BALANCE_ACTION: {
//       const { tradeAction, collateralCurrency } = yield select((state) => state.currency);
//       const { collateralAmountEntered } = yield select((state) => state.market);
//       const { isRepay } = action;

//       const label = `${tradeAction} ${isRepay ? 'repay' : ''} ${collateralCurrency}`;
//       const amount = parseFloat(collateralAmountEntered);
//       if (!amount) break;

//       trackEvent('TXN', type, label, amount);
//       break;
//     }

//     case constants.SET_PENDING_TRANSACTION: {
//       const { label, transaction } = action.payload;
//       trackEvent('TXN', type, label);
//       trackImpactTxnSubmit(impactClickId, accountAddress, transaction.hash, label, hasConsent);
//       break;
//     }

//     case constants.TRANSACTION_USER_REJECTION: {
//       const { label } = action.payload;
//       trackEvent('TXN_REJECTED', type, label);
//       break;
//     }

//     case constants.INPUT_AMOUNT:
//     case constants.INPUT_COLLATERAL_AMOUNT:
//     case constants.INPUT_ASSET_ACTION_AMOUNT:
//     case constants.BUFFERED_RATIO_CHANGE: {
//       const { amount } = action;
//       if (amount) {
//         const pathName = window.location.pathname;
//         trackEvent('INPUT', type, pathName, 1);
//       }
//       break;
//     }

//     default: {
//       trackEvent('unknown', type, '');
//       break;
//     }
//   }
// }

// export function* watchTrackingActions() {
//   yield takeEvery(constants.SET_WALLET, trackSingleEvent);
//   yield takeEvery(constants.SET_PRESELECTED_WALLET, trackSingleEvent);
//   yield takeEvery(constants.GET_SELECTED_MARKET, trackSingleEvent);
//   yield takeEvery(constants.GET_SELECTED_ASSET_MARKET, trackSingleEvent);
//   yield takeEvery(constants.SUBMIT_TRANSACTION, trackSingleEvent);
//   yield takeEvery(constants.SUBMIT_SET_ALLOWANCE, trackSingleEvent);
//   yield takeEvery(constants.SUBMIT_BALANCE_ACTION, trackSingleEvent);
//   yield takeEvery(constants.SET_PENDING_TRANSACTION, trackSingleEvent);
//   yield takeEvery(constants.TRANSACTION_USER_REJECTION, trackSingleEvent);
//   yield takeEvery(constants.SUBSCRIBE_EMAIL, trackSingleEvent);

//   // These need to be deduped a bit
//   yield debounce(1000, constants.INPUT_AMOUNT, trackSingleEvent);
//   yield debounce(1000, constants.INPUT_COLLATERAL_AMOUNT, trackSingleEvent);
//   yield debounce(1000, constants.INPUT_ASSET_ACTION_AMOUNT, trackSingleEvent);
//   yield debounce(1000, constants.BUFFERED_RATIO_CHANGE, trackSingleEvent);

//   yield takeLatest(trackingActions.setConsent, handleSetConsent);
// }
