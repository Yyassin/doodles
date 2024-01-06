import React, { useState } from 'react';
import { ipcAPI, ipcRenderer } from '@/data/ipc/ipcMessages';
import './TitlebarLegacy.css';

const TitlebarLeg = ({ title }: { title: string }) => {
  const [isActive, setIsActive] = useState(true);
  const [isMaximized, setIsMaximized] = useState(true);

  ipcRenderer.on('focused', () => {
    setIsActive(true);
    console.log('active');
  });

  ipcRenderer.on('blurred', () => {
    setIsActive(false);
  });

  ipcRenderer.on('maximized', () => {
    setIsMaximized(true);
    console.log('maxii');
  });

  ipcRenderer.on('unmaximized', () => {
    setIsMaximized(false);
  });

  const minimizeHandler = () => {
    ipcAPI.minimize('minimize');
  };

  const maximizeHandler = () => {
    ipcAPI.maximize('maximize');
  };

  const unmaximizeHandler = () => {
    ipcAPI.unmaximize('unmaximize');
  };

  const closeHandler = () => {
    ipcAPI.close('close');
  };

  return (
    <div className="Titlebar">
      <div
        className={isActive ? 'Title-Bar' : 'Title-Bar-inactive'}
        style={{
          backgroundColor: `rgba(129, 140, 248, ${isActive ? 0.5 : 0.3})`,
        }}
      >
        <div className="Titlebar-drag-region"></div>
        <div className="Title-Bar__section-icon">
          <div className="section-icon__title">{title}</div>
        </div>
        <div className="Title-Bar__section-menubar"></div>
        <div className="Title-Bar__section-center"></div>
        <div className="Title-Bar__section-windows-control">
          <div className="section-windows-control_box">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              strokeLinejoin="round"
            >
              <circle
                onClick={minimizeHandler}
                className={
                  isActive ? 'minimize-active_logo' : 'minimize-inactive_logo'
                }
                cx="11.6"
                cy="11.6"
                r="11.4"
              />
            </svg>
          </div>
          {isMaximized ? (
            <div className="section-windows-control_box">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                strokeLinejoin="round"
              >
                <circle
                  onClick={unmaximizeHandler}
                  className={
                    isActive
                      ? 'unmaximize-active_logo'
                      : 'unmaximize-inactive_logo'
                  }
                  cx="11.6"
                  cy="11.6"
                  r="11.4"
                />
              </svg>
            </div>
          ) : (
            <div className="section-windows-control_box">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                strokeLinejoin="round"
              >
                <circle
                  onClick={maximizeHandler}
                  className={
                    isActive ? 'maximize-active_logo' : 'maximize-inactive_logo'
                  }
                  cx="11.6"
                  cy="11.6"
                  r="11.4"
                />
              </svg>
            </div>
          )}
          <div className="section-windows-control_box">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              strokeLinejoin="round"
            >
              <circle
                onClick={closeHandler}
                className={
                  isActive ? 'close-active_logo' : 'close-inactive_logo'
                }
                cx="11.6"
                cy="11.6"
                r="11.4"
              />
            </svg>
          </div>
        </div>
        <div
          style={isMaximized ? { display: 'none' } : {}}
          className="resizer"
        ></div>
      </div>
    </div>
  );
};

export default TitlebarLeg;
