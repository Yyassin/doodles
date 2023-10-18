import React from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/AppStore';

const RadixCheckBoxDummy = () => {
  const { mode, setTheme } = useAppStore(['mode', 'setTheme']);

  // console.log('Radix checkbox rerender');

  return (
    <>
      <form>
        <div className="flex items-center justify-center">
          <Checkbox.Root
            onClick={() => {
              setTheme(mode === 'signin' ? 'light' : 'dark');
            }}
            className="shadow-blackA7 hover:bg-violet3 flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-[4px] bg-white shadow-[0_2px_10px] outline-none focus:shadow-[0_0_0_2px_black]"
            defaultChecked
            id="c1"
          >
            <Checkbox.Indicator className="text-violet11">
              <CheckIcon />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <label
            className="pl-[15px] text-[15px] leading-none text-black"
            htmlFor="c1"
          >
            The current mode is: {mode}
          </label>
        </div>
      </form>
    </>
  );
};

const ShadcnButtonDummy = () => {
  const { theme, setMode } = useAppStore(['theme', 'setMode']);

  // console.log('Shadcn button rerender');
  return (
    <>
      <Button onClick={() => setMode(theme === 'light' ? 'signin' : 'signup')}>
        The current theme is: {theme}
      </Button>
    </>
  );
};

const LoginPage = () => {
  return (
    <>
      <div>Login Screen</div>
      <RadixCheckBoxDummy />
      <ShadcnButtonDummy />
    </>
  );
};

export default LoginPage;
