import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAppStore } from '@/stores/AppStore';
import StableDiffusionSheetContent from './StableDiffusionSheetContent';
import CommentsSheetContent from '../CommentsSheetContent';
/**
 * Sidebar sheet that allows the user to generate images using Stable Diffusion.
 * @author Yousef Yassin
 */

const StableDiffusionSheet = () => {
  const {
    isUsingStableDiffusion,
    setIsUsingStableDiffusion,
    isViewingComments,
    setIsViewingComments,
  } = useAppStore([
    'isUsingStableDiffusion',
    'setIsUsingStableDiffusion',
    'isViewingComments',
    'setIsViewingComments',
  ]);

  return (
    <Sheet
      modal={false}
      open={isUsingStableDiffusion || isViewingComments}
      onOpenChange={(value) => {
        if (!value) {
          setIsUsingStableDiffusion(false);
          setIsViewingComments(false);
        }
      }}
    >
      {/* Prevent closing when clicking outside */}
      <SheetContent
        onInteractOutside={(e) => e.preventDefault()}
        className={isViewingComments ? 'bg-[#7F7DCF] p-0' : 'p-0'}
      >
        {isUsingStableDiffusion ? (
          <StableDiffusionSheetContent />
        ) : isViewingComments ? (
          <CommentsSheetContent />
        ) : null}
      </SheetContent>
    </Sheet>
  );
};

export default StableDiffusionSheet;
