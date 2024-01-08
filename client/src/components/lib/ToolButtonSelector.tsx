import React from 'react';
import { capitalize, getCanvasContext } from '@/lib/misc';
import IconButton from './IconButton';
import {
  CanvasElement,
  useCanvasElementStore,
} from '@/stores/CanvasElementsStore';
import { createElement } from '@/lib/canvasElements/canvasElementUtils';
import { useWebSocketStore } from '@/stores/WebSocketStore';

/**
 * This file defines the ToolButton component, which represents a button for a toolbar tool.
 * Each ToolButton has a representative icon and a state hook to set the selected tool.
 * The currently active tool is highlighted. The ToolButton component is used in various
 * tool groups in the CustomizabilityToolbar to allow the user to select different options
 * for customizing the canvas elements.
 * @author Eebro, Abdalla, Dana
 */

/**
 * Primary viewport that houses the canvas
 * and accompanying widgets/buttons that lie
 * on top of it (absolutely positioned).
 * @authors Yousef Yassin, Dana El Sherif
 */

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
    pushCanvasHistory,
    selectedElementIds,
    fillColors,
    textFontOptions,
    textSizes,
    types,
    strokeColors,
    bowings,
    roughnesses,
    strokeWidths,
    fillStyles,
    strokeLineDashes,
    opacities,
    angles,
    p1,
    p2,
    textStrings,
    toolOptions,
  } = useCanvasElementStore([
    'editCanvasElement',
    'pushCanvasHistory',
    'selectedElementIds',
    'fillColors',
    'textFontOptions',
    'textSizes',
    'types',
    'strokeColors',
    'bowings',
    'roughnesses',
    'strokeWidths',
    'fillStyles',
    'strokeLineDashes',
    'opacities',
    'freehandPoints',
    'angles',
    'p1',
    'p2',
    'textStrings',
    'textFontOptions',
    'toolOptions',
  ]);
  const { setWebsocketAction } = useWebSocketStore(['setWebsocketAction']);

  const onClick = () => {
    console.log(selectedElementIds[0]);
    // A new and customized element will be drawn
    if (selectedElementIds[0] === undefined) {
      toolOptions.strokeColor =
        customizabilityDict.strokeColor ?? toolOptions.strokeColor;

      toolOptions.fillColor =
        customizabilityDict.fillColor ?? toolOptions.fillColor;

      toolOptions.fillStyle =
        customizabilityDict.fillStyle ?? toolOptions.fillStyle;

      toolOptions.textSize =
        customizabilityDict.textSize ?? toolOptions.textSize;

      toolOptions.textFontOptions =
        customizabilityDict.textFontOption ?? toolOptions.textFontOptions;

      toolOptions.bowing = customizabilityDict.bowing ?? toolOptions.bowing;

      toolOptions.strokeWidth =
        customizabilityDict.strokeWidth ?? toolOptions.strokeWidth;

      toolOptions.roughness =
        customizabilityDict.roughness ?? toolOptions.roughness;

      toolOptions.opacities =
        customizabilityDict.opacity ?? toolOptions.opacities;
    } // An element is selected.
    else {
      const selectedElementId = selectedElementIds[0];
      const { roughElement, fillColor } = createElement(
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
          font:
            customizabilityDict.textFontOption ??
            textFontOptions[selectedElementId],
          size: customizabilityDict.textSize ?? textSizes[selectedElementId],

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

          angle: angles[selectedElementId],
        },
      );

      let extraOptions = {} as Partial<CanvasElement>;
      if (types[selectedElementId] === 'text') {
        // Set the element's font style so measuretext
        // calculates the correct width.
        const { ctx } = getCanvasContext();
        if (ctx === null) throw 'ctx null';

        const textSize =
          customizabilityDict.textSize ?? textSizes[selectedElementId];

        const textFont =
          customizabilityDict.textFontOption ??
          textFontOptions[selectedElementId];

        ctx.save();
        ctx.textBaseline = 'top';
        ctx.font = ` ${textSize}px ${textFont}`;
        const textWidth = ctx.measureText(textStrings[selectedElementId]).width;
        ctx.restore();

        const { x, y } = p1[selectedElementId];
        extraOptions = { p2: { x: x + textWidth, y: y + textSize } };
      }

      editCanvasElement(selectedElementId, {
        roughElement,
        //set explicity becaue its changed in the function createElement
        fillColor,
        ...customizabilityDict,
        ...extraOptions,
      });
      pushCanvasHistory();
      setWebsocketAction(selectedElementId, 'editCanvasElement');
    }
  };
  return (
    <IconButton label={capitalize(label)} active={active} onClick={onClick}>
      {children}
    </IconButton>
  );
};

export default ToolButton;
