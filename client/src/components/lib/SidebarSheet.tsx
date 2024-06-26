import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAppStore } from '@/stores/AppStore';
import StableDiffusionSheetContent from './StableDiffusion/StableDiffusionSheetContent';
import CommentsSheetContent from './CommentsSheetContent';
/**
 * Generic sidebar sheet component that houses the stable diffusion and comments sheets.
 * @author Yousef Yassin
 */

const SidebarSheet = () => {
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
      // A close event closes all sheets.
      onOpenChange={(value) => {
        if (!value) {
          setIsUsingStableDiffusion(false);
          setIsViewingComments(false);
        }
      }}
    >
      <SheetContent
        // Prevent closing when clicking outside
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

export default SidebarSheet;
