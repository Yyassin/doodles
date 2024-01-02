import React from 'react';
import { capitalize } from '@/lib/misc';
import IconButton from './IconButton';
import {
  CanvasElement,
  useCanvasElementStore,
} from '@/stores/CanvasElementsStore';
import { createElement } from '@/lib/canvasElements/canvasElementUtils';

/**
 * Defines a button for a toolbar tool. Contains
 * a representative icon (defined above) and
 * a state hook to set the selected tool. The currently
 * active tool is highlighted.
 * @param tool The tool the button corresponds to.
 * @param active True if this tool is currently selected, false otherwise.
 * @param children Children React nodes, if any.
 */
const ToolButton = ({
  customizabilityDict,
  label,
  active,
  children,
}: {
  customizabilityDict: Partial<CanvasElement>;
  label: string;
  active: boolean;
  children?: React.ReactNode;
}) => {
  const {
    editCanvasElement,
    selectedElementIds,
    fillColors,
    types,
    strokeColors,
    bowings,
    roughnesses,
    strokeWidths,
    fillStyles,
    strokeLineDashes,
    opacities,
    p1,
    p2,
    textStrings,
  } = useCanvasElementStore([
    'editCanvasElement',
    'selectedElementIds',
    'fillColors',
    'types',
    'strokeColors',
    'bowings',
    'roughnesses',
    'strokeWidths',
    'fillStyles',
    'strokeLineDashes',
    'opacities',
    'freehandPoints',
    'p1',
    'p2',
    'textStrings',
  ]);

  const onClick = () => {
    // If the user was able to see the panel, only one element is selected.
    const selectedElementId = selectedElementIds[0];
    const roughElement = createElement(
      selectedElementId,
      p1[selectedElementId].x,
      p1[selectedElementId].y,
      p2[selectedElementId].x,
      p2[selectedElementId].y,
      types[selectedElementId],
      undefined,
      {
        stroke:
          customizabilityDict.strokeColor ?? strokeColors[selectedElementId],

        fill: customizabilityDict.fillColor ?? fillColors[selectedElementId],

        bowing: customizabilityDict.bowing ?? bowings[selectedElementId],

        roughness:
          customizabilityDict.roughness ?? roughnesses[selectedElementId],

        strokeWidth:
          customizabilityDict.strokeWidth ?? strokeWidths[selectedElementId],

        fillStyle:
          customizabilityDict.fillStyle ?? fillStyles[selectedElementId],

        strokeLineDash:
          customizabilityDict.strokeLineDash ??
          strokeLineDashes[selectedElementId],

        opacity: customizabilityDict.opacity ?? opacities[selectedElementId],

        text: textStrings[selectedElementId],
      },
    ).roughElement;
    editCanvasElement(selectedElementId, {
      roughElement,
      ...customizabilityDict,
    });
  };

  return (
    <IconButton label={capitalize(label)} active={active} onClick={onClick}>
      {children}
    </IconButton>
  );
};

export default ToolButton;
