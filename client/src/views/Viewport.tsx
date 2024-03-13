import React, { useRef, useState } from 'react';
import Canvas from '@/components/lib/Canvas';
import DropDownMenu from '@/components/lib/DropDownMenu';
import ToolBar from '@/components/lib/ToolBar';
import { useAppStore } from '@/stores/AppStore';
import FullScreenButton from '@/components/lib/FullScreenButton';
import UndoRedoButtons from '@/components/lib/UndoRedoButtons';
import ZoomButtons from '@/components/lib/ZoomButtons';
import CustomToolbar from '@/components/lib/CustomizabilityToolbar';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import ContextMenu from '@/components/lib/ContextMenu';
import * as RadixContextMenu from '@radix-ui/react-context-menu';
import ShareScreen from '@/components/lib/ShareScreen';
import ShareScreenButton from '@/components/lib/ShareScreenButton';
import TransparencyButton from '@/components/lib/TransparencyButton';
import { IS_ELECTRON_INSTANCE } from '@/constants';
import SidebarSheet from '@/components/lib/SidebarSheet';
import { isDrawingTool } from '@/lib/misc';
import { Separator } from '@/components/ui/separator';
import BoardHeader from '@/components/lib/BoardHeader';
import ShareBoardDialog from '@/components/lib/ShareBoardDialog';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import EditBoardDataDialog from '@/components/lib/EditBoardDataDialog';
import PublishTemplateDialog from '@/components/lib/PublishTemplateDialog';

/**
 * Primary viewport that houses the canvas
 * and accompanying widgets/buttons that lie
 * on top of it (absolutely positioned).
 * @authors Yousef Yassin, Abdalla Abdelhadi, Zakariyya Almalki
 */
const Viewport = () => {
  const { tool, isTransparent } = useAppStore(['tool', 'isTransparent']);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { selectedElementIds } = useCanvasElementStore(['selectedElementIds']);
  const isDrawingSelected = isDrawingTool(tool);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { boardMeta } = useCanvasBoardStore(['boardMeta']);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPubDialogOpen, setIsPubDialogOpen] = useState(false);

  return (
    <RadixContextMenu.Root>
      <div
        id="Viewport"
        className="select-none"
        ref={viewportRef}
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          backgroundColor: 'transparent',
        }}
      >
        <RadixContextMenu.Trigger>
          <ShareScreen />
          <Canvas />
          {/* Add the comments here, make the sheet purple */}
          <SidebarSheet />
          {/* TODO: Merge with screenselect */}
          <ShareBoardDialog
            open={isShareDialogOpen}
            setOpen={setIsShareDialogOpen}
            boardLink={boardMeta.shareUrl}
            users={boardMeta.users}
          />
          <EditBoardDataDialog
            open={isEditDialogOpen}
            setOpen={setIsEditDialogOpen}
          />
          <PublishTemplateDialog
            open={isPubDialogOpen}
            setOpen={setIsPubDialogOpen}
          />
        </RadixContextMenu.Trigger>
        <div
          className="flex flex-col"
          style={{
            height: '100%',
            width: '100%',
          }}
        >
          {/* The header */}
          {!isTransparent && (
            <div className="z-10">
              <BoardHeader
                setIsShareDialogOpen={setIsShareDialogOpen}
                isShareDialogOpen={isShareDialogOpen}
              />
              <Separator />
            </div>
          )}
          {/* The Canvas */}
          <div
            style={{
              backgroundColor: 'transparent',
              flexGrow: 90,
            }}
          >
            <RadixContextMenu.Root>
              <div
                id="Viewport"
                className="select-none"
                ref={viewportRef}
                style={{
                  position: 'relative',
                  height: '100%',
                  width: '100%',
                  backgroundColor: 'transparent',
                }}
              >
                <ToolBar />
                {/* Only show the toolbar is an element is selected */}
                {(selectedElementIds.length === 1 || isDrawingSelected) && (
                  <CustomToolbar />
                )}
                <DropDownMenu
                  viewportRef={viewportRef}
                  isEditDialogOpen={isEditDialogOpen}
                  setIsEditDialogOpen={setIsEditDialogOpen}
                  isPubDialogOpen={isPubDialogOpen}
                  setIsPubDialogOpen={setIsPubDialogOpen}
                />

                <div
                  className="flex gap-[0.5rem] z-10"
                  style={{
                    position: 'absolute',
                    bottom: `calc(1rem + ${!isTransparent ? 30 : 0}px)`,
                    left: '1rem',
                  }}
                >
                  <ZoomButtons />
                  {boardMeta.permission !== 'view' && <UndoRedoButtons />}
                  <FullScreenButton viewportRef={viewportRef} />
                  {boardMeta.permission !== 'view' && <ShareScreenButton />}
                  {IS_ELECTRON_INSTANCE && <TransparencyButton />}
                </div>
              </div>
              <ContextMenu />
            </RadixContextMenu.Root>
          </div>
        </div>
      </div>
      <ContextMenu />
    </RadixContextMenu.Root>
  );
};

export default Viewport;
