// src/Toolbar.tsx
import React from 'react';
import open_icon from '/images/erase_icon.png';

const Toolbar: React.FC = () => {
  const handleButtonClick = () => {
    console.log('Button clicked');
  };

  return (
    <div className="toolbar">
      <li className="toolbaritems">
        <button onClick={() => handleButtonClick()}>
          <img src={open_icon} alt="" />
        </button>
      </li>
    </div>
  );
};

export default Toolbar;
