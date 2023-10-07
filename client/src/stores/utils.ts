import { StoreApi, UseBoundStore } from 'zustand';
import { shallow } from 'zustand/shallow';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { GenericStore } from './types';

/**
 * Store utility functions
 * Pattern Reference: https://dev.to/eraywebdev/optimizing-zustand-how-to-prevent-unnecessary-re-renders-in-your-react-app-59do
 * @authors Yousef Yassin
 */

/**
 * Provided a store, returns an agumented store that accepts
 * state selectors as an array of keys.
 *
 * Example usage:
 * const useAppStore = createStoreWithSelectors(appStore);
 * const { mode, setTheme } = useAppStore(['mode', 'setTheme']);
 *
 * The benefit here is that the subscribed component will only
 * re-render on state changes in mode and setTheme (which shouldn't change),
 * rather than all fields defined in state.
 *
 * @param store The store to augment.
 * @returns The augmented store hook that accepts selectors.
 */
export const createStoreWithSelectors = <T extends GenericStore>(
  store: UseBoundStore<StoreApi<T>>,
): (<K extends keyof T>(keys: K[]) => Pick<T, K>) => {
  return <K extends keyof T>(keys: K[]) => {
    /**
     * Iterates over the provided store and extracts the
     * key-value pairs for the provided keys *by-reference*!
     */
    const selector = (state: T) =>
      keys.reduce(
        (acc, cur) => {
          acc[cur] = state[cur];
          return acc;
        },
        {} as Pick<T, K>,
      );

    // Store hook for the selected key-value pairs. The
    // equality function, shallow, means we only listen for changes
    // where the value reference has changed (so all state changes
    // must be immutable).
    return useStoreWithEqualityFn(store, selector, shallow);
  };
};
