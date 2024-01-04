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

//Defines fonts as CSS properties for Toolbar Icons
const fontStyles: Record<fontType, React.CSSProperties> = {
  trebuchetMS: { fontFamily: 'Trebuchet MS' },
  timesNewRoman: { fontFamily: 'Times New Roman' },
  garamond: { fontFamily: 'Garamond' },
  courierNew: { fontFamily: 'Courier New' },
  brushScriptMT: { fontFamily: 'Brush Script MT, cursive' },
  comicSans: { fontFamily: 'Comic Sans MS' },
};

//Maps each font to its name
const mapColour = {
  trebuchetMS: '30px trebuchet MS',
  timesNewRoman: '30px times New Roman',
  garamond: '30px garamond',
  courierNew: '30px courier New',
  brushScriptMT: '30px brush Script MT, cursive',
  comicSans: '30px Comic Sans MS',
};

/**
 * Creates a row group of buttons corresponding
 * to the provided list of tools.
 * @param tools The list of tools
 * @param selectedTool The currently selected tool, used
 * to highlight the selected tool.
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
            customizabilityDict={{ textFontOption: mapColour[toolName] }}
            label={toolName}
            active={
              textFontOptions[selectedElementIds[0]] === fontStyles[toolName]
            }
          >
            <div
              className={'w-5 h-5 rounded-full ' + fontStyles[toolName]}
            ></div>
            <span style={fontStyles[toolName]}>A</span>
          </ToolButton>
        </div>
      ))}
    </div>
  );
};
export default FontFamily;
