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
  'timesNewRoman',
  'garamond',
  'courierNew',
  'brushScriptMT',
  'comicSans',
] as const;
export type fontType = (typeof fontTypes)[number];

//Defines fonts as CSS properties for the Toolbar Icons
const fontStyles: Record<fontType, string> = {
  trebuchetMS: 'Trebuchet MS',
  timesNewRoman: 'Times New Roman',
  garamond: 'Garamond',
  courierNew: 'Courier New',
  brushScriptMT: 'Brush Script MT, cursive',
  comicSans: 'Comic Sans MS',
};

//Maps each font to its label
const mapFonts = {
  trebuchetMS: 'trebuchet MS',
  timesNewRoman: 'times new roman',
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
  const { fontFamilies, selectedElementIds, toolOptions } =
    useCanvasElementStore([
      'fontFamilies',
      'selectedElementIds',
      'toolOptions',
    ]);

  const interestValue = selectedElementIds[0]
    ? fontFamilies[selectedElementIds[0]]
    : toolOptions.fontFamily;
  return (
    <div className="flex">
      {tools.map((toolName) => (
        <div key={`CustomToolbar-${toolName}`} className="relative">
          <ToolButton
            customizabilityDict={{ fontFamily: mapFonts[toolName] }}
            label={toolName}
            active={interestValue === mapFonts[toolName]}
          >
            <div
              className="rounded-full"
              style={{
                fontFamily: fontStyles[toolName], //Can make it more spaced out in future
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
