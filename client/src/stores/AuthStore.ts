import { create } from 'zustand';
import { SetState } from './types';
import { createStoreWithSelectors } from './utils';

/**
 * Define Global Auth states and reducers
 * @author Zakariyya Almalki
 */

/** Definitions */
interface AuthState {
  userFirstName: string;
  userLastName: string;
  userEmail: string | null;
  userPicture: string;
}

interface AuthActions {
  // Reducer to setuser
  setUser: (
    userFirstName: string,
    userLastName: string,
    userEmail: string | null,
    userPicture: string,
  ) => void;
}

type AuthStore = AuthActions & AuthState;

// Initialize Auth State to default state.
export const initialAuthState: AuthState = {
  userFirstName: '',
  userLastName: '',
  userEmail: '',
  userPicture: '',
};

/** Actions / Reducers */
const setUser =
  (set: SetState<AuthStore>) =>
  (
    userFirstName: string,
    userLastName: string,
    userEmail: string | null,
    userPicture: string,
  ) =>
    set(() => {
      return { userFirstName, userLastName, userEmail, userPicture };
    });

/** Store Hook */
const AuthStore = create<AuthStore>()((set) => ({
  ...initialAuthState,
  setUser: setUser(set),
}));
export const useAuthStore = createStoreWithSelectors(AuthStore);
