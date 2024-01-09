import React from 'react';
import { CanvasButton } from './CanvasButton';
import { useAppStore } from '@/stores/AppStore';

/**
 * Defines a button component for starting/stopping screen sharing.
 * @author Yousef Yassin
 */

/**
 * Icon component for sharing screen, used in the ShareScreenButton component.
 * @param {string} className - CSS class names for styling.
 */
const ShareScreenIcon = ({ className }: { className: string }) => {
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
        d="M10.0046 6.6503C7.24714 6.6503 5.00464 8.863 5.00464 11.5839V38.7184C5.00464 41.4417 7.24714 43.6519 10.0046 43.6519H27.5046V48.5855H17.5046V53.519H42.5046V48.5855H32.5046V43.6519H50.0046C52.7621 43.6519 55.0046 41.4417 55.0046 38.7184V11.5839C55.0046 8.863 52.7621 6.6503 50.0046 6.6503H10.0046ZM15.0046 37.485C19.1746 31.7189 24.6646 29.098 33.0046 29.098V35.8508L45.0046 24.3186L33.0046 12.8172V19.385C21.3346 21.0501 16.6846 29.2521 15.0046 37.485Z"
      />
    </svg>
  );
};

/**
 * Icon component for stopping screen sharing, used in the ShareScreenButton component.
 * @param {string} className - CSS class names for styling.
 */
const UnshareScreenIcon = ({ className }: { className: string }) => {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.0044 6.62927C8.24689 6.62927 6.00439 8.83465 6.00439 11.5465V38.5912C6.00439 41.3055 8.24689 43.5084 11.0044 43.5084H28.5044V48.4256H18.5044V53.3429H43.5044V48.4256H33.5044V43.5084H51.0044C53.7619 43.5084 56.0044 41.3055 56.0044 38.5912V11.5465C56.0044 8.83465 53.7619 6.62927 51.0044 6.62927H11.0044ZM37.3751 15.2344L41.0044 18.8037L34.6209 25.0562L41.0044 31.3341L37.3751 34.9033L31.0171 28.6255L24.6337 34.9033L21.0044 31.3341L27.3879 25.0562L21.0044 18.8037L24.6337 15.2344L31.0171 21.5122L37.3751 15.2344Z" />
    </svg>
  );
};

/**
 * Button component for starting/stopping screen sharing.
 */
const defaultClassName = 'disabled:opacity-40 disabled:cursor-not-allowed';
const ShareScreenButton = () => {
  const { isSharingScreen, setIsSharingScreen, isInCall } = useAppStore([
    'isSharingScreen',
    'setIsSharingScreen',
    'isInCall',
  ]);

  return (
    <CanvasButton
      disabled={isInCall && !isSharingScreen}
      onClick={() => {
        setIsSharingScreen(!isSharingScreen);
      }}
      className={`${defaultClassName} ${
        isSharingScreen ? 'bg-red-600 enabled:hover:bg-red-400' : 'bg-white'
      }`}
      tooltip={{
        content: isSharingScreen ? 'Stop Fullscreen' : 'Start Sharing Screen',
        side: 'top',
        sideOffset: 5,
      }}
    >
      {isSharingScreen ? (
        <UnshareScreenIcon className="fill-current text-white" />
      ) : (
        <ShareScreenIcon className="fill-current text-black" />
      )}
    </CanvasButton>
  );
};

export default ShareScreenButton;
