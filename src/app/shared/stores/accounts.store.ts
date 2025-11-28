import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { AccountModel } from '../models/account-model';

type AccountState = {
    accounts: AccountModel[];
};

const initialState: AccountState = {
    accounts: [],
};

export const AccountStore = signalStore(
    {
        providedIn: 'root',
    },
    withState(initialState),
    withMethods((store) => {
        function setAccounts(accounts: AccountModel[]) {
            patchState(store, (currentState) => ({
                accounts: accounts,
            }));
        }

        return { setAccounts };
    })
);
