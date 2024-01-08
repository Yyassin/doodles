import React from 'react';
import { CanvasButton } from './CanvasButton';
import { useAppStore } from '@/stores/AppStore';

/**
 * Defines a button component for starting/stopping transparency mode.
 * @author Yousef Yassin
 */

const TransparencyIcon = ({ className }: { className: string }) => {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5 7.98328C9.73857 7.98328 7.5 10.2219 7.5 12.9833V47.9833C7.5 50.7448 9.73857 52.9833 12.5 52.9833H47.5C50.2615 52.9833 52.5 50.7448 52.5 47.9833V12.9833C52.5 10.2219 50.2615 7.98328 47.5 7.98328H12.5ZM42.2487 21.5188L38.7132 17.9832L17.5 39.1965L21.0355 42.732L42.2487 21.5188Z"
        fill="black"
      />
    </svg>
  );
};

/**
 * Button component for starting/stopping transparency mode.
 */
const defaultClassName = 'disabled:opacity-40 disabled:cursor-not-allowed';
const TransparencyButton = () => {
  const { isTransparent, setIsTransparent, setPanOffset, setAppZoom } =
    useAppStore([
      'isTransparent',
      'setIsTransparent',
      'setPanOffset',
      'setAppZoom',
    ]);

  return (
    <CanvasButton
      onClick={() => {
        setPanOffset(0, 0);
        setAppZoom(1);
        setIsTransparent(!isTransparent);
      }}
      className={`${defaultClassName} ${
        isTransparent ? 'bg-red-600 enabled:hover:bg-red-400' : 'bg-white'
      }`}
      tooltip={{
        content: isTransparent
          ? 'Exit Transparency Mode'
          : 'Enter Transparency Mode',
        side: 'top',
        sideOffset: 5,
      }}
    >
      <TransparencyIcon className="fill-current text-black" />
    </CanvasButton>
  );
};

export default TransparencyButton;
