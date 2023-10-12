import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { it, expect, describe } from 'vitest';
import { useAppStore, initialAppState } from '../../src/stores/AppStore';

/**
 * Tests the CreateStoreWithSelectors utility
 * method.
 * @author Yousef Yassin
 */
describe('CreateStoreWithSelectors', () => {
  /**
   * We create a component and subscribe to a single state, mode.
   * We mutate mode and theme, and ensure that the component only
   * rerender in the former's state changes.
   */
  it('Should only rerender when selected state is mutated', () => {
    // -1 To account for the initial render, that will put us to 0.
    let rerenderCount = -1;
    const { theme: initialTheme } = initialAppState;
    const htmlIds = {
      text: 'text',
      themeButton: 'theme-btn',
      modeButton: 'mode-btn',
    } as const;

    // Create an render a component that is only
    // subscribed to the mode state.
    const Component = () => {
      const { mode, setTheme, setMode } = useAppStore([
        'mode',
        'setTheme',
        'setMode',
      ]);

      // Increment count for every rerender.
      rerenderCount++;

      return (
        <>
          <div data-testid={htmlIds.text}>Mode is {mode}</div>
          <button
            data-testid={htmlIds.modeButton}
            /** Toggle mode */
            onClick={() => setMode(mode === 'pan' ? 'select' : 'pan')}
          >
            Set Mode
          </button>
          <button
            data-testid={htmlIds.themeButton}
            // Toggle theme
            onClick={() =>
              setTheme(initialTheme === 'light' ? 'dark' : 'light')
            }
          >
            Set Theme
          </button>
        </>
      );
    };

    const page = render(<Component />);
    const textInnerHtml = () => page.getByTestId(htmlIds.text).innerHTML;
    const modeButton = page.getByTestId(htmlIds.modeButton);
    const themeButton = page.getByTestId(htmlIds.themeButton);

    expect(textInnerHtml()).toBe('Mode is select');

    // Toggle the mode -- the component should rerender;
    fireEvent.click(modeButton);
    expect(rerenderCount).toBe(1);
    expect(textInnerHtml()).toBe('Mode is pan');

    // Toggle the theme -- the component should not rerender,
    // since it isn't subscribed to the theme state.
    fireEvent.click(themeButton);
    expect(rerenderCount).toBe(1);
    expect(textInnerHtml()).toBe('Mode is pan');

    // Toggle the mode again -- the component should rerender;
    fireEvent.click(modeButton);
    expect(rerenderCount).toBe(2);
    expect(textInnerHtml()).toBe('Mode is select');

    page.unmount();
  });
});

// TODO: Zustand tests for drawing once finalize: https://blog.peslostudios.com/blog/zustand-writing-tests-for-your-data-store/
