import React, { useEffect, useState } from 'react';
import TitlebarWin from './TitlebarWindows';
import TitlebarLeg from './TitlebarLegacy';

const osNameMap = {
  Win: 'Windows',
  Mac: 'MacOS',
  X11: 'UNIX',
  Linux: 'Linux',
} as const;

const Titlebar = ({ title, fg }: { title: string; fg: string }) => {
  const [os, setOs] = useState<string>('Windows');

  useEffect(() => {
    Object.values(osNameMap).forEach((osName) => {
      if (navigator.appVersion.indexOf(osName) !== -1) {
        setOs(osName);
      }
    });
  }, []);

  return os !== 'MacOS' ? (
    <TitlebarWin title={title} fg={fg} />
  ) : (
    <TitlebarLeg title={title} />
  );
};

export default Titlebar;
