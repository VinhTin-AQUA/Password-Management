import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

type Passcode = {
    passCode: string;
};

const initialState: Passcode = {
    passCode: '',
};

export const PasscodeStore = signalStore(
    {
        providedIn: 'root',
    },
    withState(initialState),
    withMethods((store) => {
        function updatePasscode(passCode: string) {
            patchState(store, (currentState) => ({
                passCode: passCode,
            }));
        }

        return { updatePasscode };
    })
);
