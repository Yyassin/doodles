import React from 'react';
import { ImageIcon } from '@radix-ui/react-icons';
import { useAppStore } from '@/stores/AppStore';
import ContextMenuItem from '../ContextMenuItem';

/**
 * Context Menu options that supports exporting only selected
 * items as a PNG image.
 * @author Yousef Yassin
 */

const StableDiffusionContextItem = () => {
  const { setIsUsingStableDiffusion } = useAppStore([
    'setIsUsingStableDiffusion',
  ]);
  return (
    <ContextMenuItem
      className="text-violet-500"
      onClick={() => {
        setIsUsingStableDiffusion(true);
      }}
    >
      Stable Diffusion
      <div className="ml-auto pl-5 text-violet-500 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">
        <ImageIcon />
      </div>
    </ContextMenuItem>
  );
};

export default StableDiffusionContextItem;
