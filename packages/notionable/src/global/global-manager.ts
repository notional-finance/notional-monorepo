// import { Observable, merge } from 'rxjs';
// import { GlobalState } from './global-state';
// import { onAppLoad } from './sagas/on-app-load';
// import { onWalletConnect } from './sagas/on-wallet-connect';
// import { onTransact } from './sagas/on-transact';
// import { onDataUpdate } from './sagas/on-data-update';

// export const loadGlobalManager = (
//   global$: Observable<GlobalState>
// ): Observable<Partial<GlobalState>> => {
//   return merge(
//     onTransact(global$),
//     onWalletConnect(global$),
//     onDataUpdate(global$),
//     onAppLoad(global$)
//   );
// };
