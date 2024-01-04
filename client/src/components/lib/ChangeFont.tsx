import React from 'react';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import ToolButton from './ToolButtonSelector';

/**
 * Defines the ChangeFont component, which allows users to
 * choose the font of their text elements.
 * @author Dana El Sherif
 */

/** Lists all the avaialble fonts. */
export const fontTypes = [
  'trebuchetMS',
  'garamond',
  'courierNew',
  'brushScriptMT',
  'comicSans',
] as const;
export type fontType = (typeof fontTypes)[number];

//Defines fonts as CSS properties for the Toolbar Icons
const fontStyles: Record<fontType, React.CSSProperties> = {
  trebuchetMS: { fontFamily: 'Trebuchet MS' },
  garamond: { fontFamily: 'Garamond' },
  courierNew: { fontFamily: 'Courier New' },
  brushScriptMT: { fontFamily: 'Brush Script MT, cursive' },
  comicSans: { fontFamily: 'Comic Sans MS' },
};

//Maps each font to its label
const mapFonts = {
  trebuchetMS: 'trebuchet MS',
  garamond: 'garamond',
  courierNew: 'courier New',
  brushScriptMT: 'brush Script MT, cursive',
  comicSans: 'Comic Sans MS',
};

/**
 * Creates a row group of buttons corresponding
 * to the provided list of fonts.
 * @param tools The list of fonts
 * @param selectedTool The currently selected dont, used
 * to highlight the selected font.
 */
const FontFamily = ({ tools }: { tools: fontType[] }) => {
  const { textFontOptions, selectedElementIds } = useCanvasElementStore([
    'textFontOptions',
    'selectedElementIds',
  ]);

  return (
    <div className="flex">
      {tools.map((toolName) => (
        <div key={`CustomToolbar-${toolName}`} className="relative">
          <ToolButton
            customizabilityDict={{ textFontOption: mapFonts[toolName] }}
            label={toolName}
            active={
              textFontOptions[selectedElementIds[0]] === fontStyles[toolName]
            }
          >
            <div
              className="rounded-full"
              style={{
                ...fontStyles[toolName], //Can make it more spaced out in future
              }}
            >
              A
            </div>
          </ToolButton>
        </div>
      ))}
    </div>
  );
};

export default FontFamily;
