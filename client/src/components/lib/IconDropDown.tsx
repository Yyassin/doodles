import React from 'react';
import { useAppStore } from '@/stores/AppStore';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { getAuth, signOut } from 'firebase/auth';
import { firebaseApp } from '../../firebaseDB/firebase';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Avatar from '@radix-ui/react-avatar';
import { ACCESS_TOKEN_TAG } from '../../constants';

/**
 * Define a react component that displays a the user infromation with a dropdown menu
 * @author Abdalla Abdelhadi, Zakariyya Almalki
 */

export const IconDropDown = () => {
  const { setMode } = useAppStore(['setMode']);
  const handleLogOut = async () => {
    try {
      await signOut(getAuth(firebaseApp));
      localStorage.removeItem(ACCESS_TOKEN_TAG);
      setMode('signin'); // if logout works, bring back to sign in page
    } catch (error: unknown) {
      console.error(error);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="h-[50px] mr-5 gap-2 inline-flex items-center justify-center text-violet11 bg-white shadow-blackA4 outline-none hover:bg-violet3"
          aria-label="Customise options"
        >
          <Avatar.Root className="bg-blackA1 inline-flex h-[45px] w-[45px] select-none items-center justify-center overflow-hidden rounded-full align-middle">
            <Avatar.Image
              className="h-full w-full rounded-[inherit] object-cover"
              src="https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-1.2.1&w=128&h=128&dpr=2&q=80"
            />
            <Avatar.Fallback
              className="text-violet11 leading-1 flex h-full w-full items-center justify-center bg-white text-[15px] font-medium"
              delayMs={600}
            >
              JD
            </Avatar.Fallback>
          </Avatar.Root>
          <div className="flex flex-col">
            <div>Test bye</div>
            <div className="text-xs">job</div>
          </div>
          <ChevronDownIcon />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[20px] bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
          side={'bottom'}
          sideOffset={5}
          align="center"
          alignOffset={0}
        >
          <DropdownMenu.Item className="group text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[25px] relative px-[25px] select-none outline-none  data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-white hover:bg-[#7f7dcf]">
            Test
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-[1px] bg-neutral-200 m-[5px]" />
          <DropdownMenu.Item
            onClick={handleLogOut}
            className="group text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[25px] relative px-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-white hover:bg-red-600"
          >
            Log Out
          </DropdownMenu.Item>
          <DropdownMenu.Arrow className="fill-white" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
