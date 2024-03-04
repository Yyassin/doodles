import React from 'react';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { useToast } from '@/components/ui/use-toast';
/**
 * Component that allows users to attach a link to a canvas element.
 * Modified to prompt for link input on button click.
 * @author Dana El Sherif
 */
const LinkAttach = () => {
  const { selectedElementIds, updateAttachedUrl } = useCanvasElementStore([
    'selectedElementIds',
    'updateAttachedUrl',
  ]);
  const { toast } = useToast();

  const attachLink = () => {
    if (selectedElementIds.length > 0) {
      const link = window.prompt('Enter link:');
      if (link !== null && link !== '') {
        updateAttachedUrl(selectedElementIds[0], link);
        toast({
          title: 'Link Attached',
          description: 'Link has been successfully attached.',
        });
      }
    }
  };

  return (
    <div className="ml-auto pl-6 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">
      <button
        onClick={attachLink}
        className="cursor-pointer text-[13px] leading-none text-violet-500"
      >
        Attach Link
      </button>
    </div>
  );
};

export default LinkAttach;
