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
  userEmail: string;
  userPicture: string;
  userID: string;
}

interface AuthActions {
  // Reducer to setuser
  setUser: (
    userFirstName: string,
    userLastName: string,
    userEmail: string | null,
    userPicture: string,
    userID: string,
  ) => void;
  updateUser: (meta: Partial<AuthState>) => void;
}

type AuthStore = AuthActions & AuthState;

// Initialize Auth State to default state.
export const initialAuthState: AuthState = {
  userFirstName: '',
  userLastName: '',
  userEmail: '',
  userPicture: '',
  userID: '',
};

/** Actions / Reducers */
const setUser =
  (set: SetState<AuthStore>) =>
  (
    userFirstName: string,
    userLastName: string,
    userEmail: string | null,
    userPicture: string,
    userID: string,
  ) =>
    set(() => {
      return {
        userFirstName,
        userLastName,
        // The random id allows the same user to login to different
        // clients, helpful for tests but not irl.
        userEmail: userEmail ?? ' ',
        userPicture,
        userID,
      };
    });

const updateUser = (set: SetState<AuthStore>) => (meta: Partial<AuthState>) => {
  set((state) => {
    return { ...state, ...meta };
  });
};

/** Store Hook */
const AuthStore = create<AuthStore>()((set) => ({
  ...initialAuthState,
  setUser: setUser(set),
  updateUser: updateUser(set),
}));
export const useAuthStore = createStoreWithSelectors(AuthStore);
