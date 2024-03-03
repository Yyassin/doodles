import React from 'react';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import ToolButton from './ToolButtonSelector';
import { CanvasElementFillStyle } from '@/types';
import HachureSVG from '@/assets/Hachure';
import CrossHatchedSVG from '@/assets/CrossHatched';
import DashedSVG from '@/assets/Dashed';
import ZigzagLineSVG from '@/assets/ZigzagLine';
import DotsSVG from '@/assets/Dots';
import ZigzagSVG from '@/assets/Zigzag';
import NoneSVG from '@/assets/None';
import SolidSVG from '@/assets/Solid';

/**
 * This file defines the ChangeFillStyle component, which allows the user to select
 * a fill style for the canvas elements. The available fill styles are defined in the
 * `fillStyleMap` and `mapFillStyle` objects, which map these styles to their
 * corresponding CSS classes and fill style values respectively.
 * @author Eebro
 */

const fillStyleMap: Record<string, JSX.Element> = {
  none: <NoneSVG />,
  hachure: <HachureSVG />,
  solid: <SolidSVG />,
  zigzag: <ZigzagSVG />,
  ['cross-hatch']: <CrossHatchedSVG />,
  dots: <DotsSVG />,
  dashed: <DashedSVG />,
  ['zigzag-line']: <ZigzagLineSVG />,
};

const mapFillStyle = {
  none: 'none',
  hachure: 'hachure',
  solid: 'solid',
  zigzag: 'zigzag',
  ['cross-hatch']: 'cross-hatch',
  dots: 'dots',
  dashed: 'dashed',
  ['zigzag-line']: 'zigzag-line',
} as const;

/**
 * Creates a row group of buttons corresponding
 * to the provided list of tools.
 * @param tools The list of tools
 * @param selectedTool The currently selected tool, used
 * to highlight the selected tool.
 */
const FillStyleToolGroup = ({ tools }: { tools: CanvasElementFillStyle[] }) => {
  const { fillStyles, selectedElementIds, toolOptions } = useCanvasElementStore(
    ['fillStyles', 'selectedElementIds', 'toolOptions'],
  );
  const interestValue = selectedElementIds[0]
    ? fillStyles[selectedElementIds[0]]
    : toolOptions.fillStyle;
  return (
    <div className="grid grid-cols-4">
      {tools.map((toolName) => (
        <div key={`CustomToolbar-${toolName}`} className="relative">
          <ToolButton
            customizabilityDict={{ fillStyle: mapFillStyle[toolName] }}
            label={toolName}
            active={interestValue === mapFillStyle[toolName]}
          >
            {fillStyleMap[toolName]}
          </ToolButton>
        </div>
      ))}
    </div>
  );
};
export default FillStyleToolGroup;
