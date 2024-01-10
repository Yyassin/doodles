import React, { useEffect } from 'react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { useAppStore } from '@/stores/AppStore';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { createElement } from '@/lib/canvasElements/canvasElementUtils';
import { renderElementsOnOffscreenCanvas } from '@/lib/export';
import { stableDiffusion } from '@/api';
import {
  dataURLToFile,
  generateRandId,
  getDataURL,
  resizeImageFile,
} from '@/lib/bytes';
import { injectImageElement } from '@/lib/image';

/**
 * Sidebar sheet that allows the user to generate images using Stable Diffusion.
 * @author Yousef Yassin
 */

const StableDiffusionSheet = () => {
  const { setPendingImageElement, addCanvasShape, editCanvasElement } =
    useCanvasElementStore([
      'setPendingImageElement',
      'addCanvasShape',
      'editCanvasElement',
    ]);
  const { isUsingStableDiffusion, setIsUsingStableDiffusion } = useAppStore([
    'isUsingStableDiffusion',
    'setIsUsingStableDiffusion',
  ]);
  const { canvasColor, setTool } = useAppStore(['canvasColor', 'setTool']);
  const {
    selectedElementIds,
    p1,
    p2,
    types,
    freehandPoints,
    freehandBounds,
    textStrings,
    fontFamilies,
    fontSizes,
    fillColors,
    fileIds,
    isImagePlaceds,
    angles,
    roughElements,
    opacities,
    strokeColors,
    strokeWidths,
  } = useCanvasElementStore([
    'selectedElementIds',
    'p1',
    'p2',
    'types',
    'freehandPoints',
    'freehandBounds',
    'textStrings',
    'fontFamilies',
    'fontSizes',
    'fillColors',
    'fileIds',
    'isImagePlaceds',
    'angles',
    'roughElements',
    'opacities',
    'strokeColors',
    'strokeWidths',
  ]);
  const [dataURL, setDataURL] = React.useState<string>('');
  const [prompt, setPrompt] = React.useState<string>('');
  const [diffusionImages, setDiffusionImages] = React.useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const populateDataURL = () => {
    const canvas = renderElementsOnOffscreenCanvas(
      selectedElementIds,
      {
        p1,
        p2,
        angles,
        types,
        freehandPoints,
        freehandBounds,
        textStrings,
        fontFamilies,
        fontSizes,
        fillColors,
        isImagePlaceds,
        fileIds,
        roughElements,
        opacities,
        strokeColors,
        strokeWidths,
      },
      {
        margin: 20,
        canvasColor,
      },
    );
    canvas && setDataURL(canvas.toDataURL('image/png'));
  };

  useEffect(() => {
    populateDataURL();
  }, [isUsingStableDiffusion]);
  return (
    <Sheet
      modal={false}
      open={isUsingStableDiffusion}
      onOpenChange={setIsUsingStableDiffusion}
    >
      {/* Prevent closing when clicking outside */}
      <SheetContent onInteractOutside={(e) => e.preventDefault()}>
        <SheetHeader>
          <SheetTitle>Stable Diffusion</SheetTitle>
          <SheetDescription>
            Enter a prompt, and watch the magic happen!
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2 pt-[1rem]">
          <div>
            <Label htmlFor="prompt">Prompt</Label>
          </div>

          <Input
            id="promp"
            placeholder="Something Creative"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-center p-[2rem]">
          <div className={`w-[10rem] overflow-hidden rounded-md`}>
            <img className="h-full w-full object-cover" src={dataURL} />
          </div>
        </div>

        {diffusionImages.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 overflow-y-scroll max-h-[35rem] p-[1rem]">
            {diffusionImages.map((imageDataURL, i) => (
              <div
                key={`SD_IM_${i}`}
                className={`flex items-center justify-center ${
                  i === selectedIdx
                    ? 'ring-4 ring-offset-2 ring-[#818cf8]'
                    : 'hover:ring-2 hover:ring-offset-2 hover:ring-[#818cf8]'
                }`}
              >
                <div
                  className={`w-[16rem] overflow-hidden rounded-md`}
                  onClick={() => setSelectedIdx(i)}
                >
                  <img
                    className="h-full w-full object-cover"
                    src={imageDataURL}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <SheetFooter className="sm:justify-start pt-4">
          <Button onClick={populateDataURL}>Refresh</Button>
          <Button
            disabled={isLoading}
            onClick={async () => {
              // TODO: resize on set
              const imSize = 96;
              const resizedFile = dataURL && dataURLToFile(dataURL);
              if (!resizedFile) return;
              const resizedImage = await resizeImageFile(resizedFile, {
                maxWidthOrHeight: imSize,
              });
              const resizedDataURL = await getDataURL(resizedImage);
              setIsLoading(true);
              const { image_data_urls: imageDataURLS } =
                await stableDiffusion.diffusion(prompt, resizedDataURL);
              setIsLoading(false);
              setDiffusionImages(imageDataURLS);
            }}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>
          <SheetClose asChild>
            <Button
              onClick={async () => {
                const selectedDataURL = diffusionImages[selectedIdx];
                const imageFile = dataURLToFile(selectedDataURL);
                // Create a proxy element
                const id = generateRandId();
                const placeholderElement = createElement(
                  id,
                  0,
                  0,
                  0,
                  0,
                  'image',
                );
                setPendingImageElement(id);
                // Inject the image into the proxy
                await injectImageElement(
                  placeholderElement,
                  imageFile,
                  addCanvasShape,
                  editCanvasElement,
                  true,
                );
                // And let the user place the image
                setTool('image');
              }}
            >
              Done
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default StableDiffusionSheet;
