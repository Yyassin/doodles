import React, { useState, useEffect, useRef } from 'react';
import menu_icon from '/images/menu_icon.jpg';
import export_icon from '/images/export_icon.jpg';
import save_icon from '/images/save_icon.png';
import live_icon from '/images/live_icon.png';
import reset_icon from '/images/reset_icon.png';
import info_icon from '/images/info_icon.png';
import open_icon from '/images/open_icon.png';
import canvasStyle_icon from '/images/canvasStyle_icon.png';

/**
 * DropDown Menu
 * @author Dana El Sherif
 */
export default function DropDownMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (!menuRef.current.contains(e.target)) {
        setOpen(false);
        console.log(menuRef.current);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
    };
  });

  function handleExport() {
    // Add code to handle export functionality
    console.log('Exporting...');
  }

  function handleSave() {
    // Add code to handle save functionality
    console.log('Saving...');
  }

  function handleInfo() {
    // Add code to handle info functionality
    console.log('Info...');
  }

  function handleOpen() {
    // Add code to handle info functionality
    console.log('Opening...');
  }

  function handleShare() {
    // Add code to handle share functionality
    console.log('Sharing...');
  }

  function handleReset() {
    // Add code to handle reset functionality
    console.log('Resetting...');
  }

  function handleStyle() {
    // Add code to handle save functionality
    console.log('Editing Canvas...');
  }

  return (
    <div className="DropDownMenu">
      <div className="menu-container" ref={menuRef}>
        <div
          className="menu-trigger"
          onClick={() => {
            setOpen(!open);
          }}
        >
          <img src={menu_icon} alt=""></img>
        </div>
        <div className={`dropdown-menu ${open ? 'active' : 'inactive'}`}>
          <ul>
            <DropdownItem
              img={open_icon}
              text={'Open'}
              onClick={() => {
                handleOpen();
              }}
            />
            <DropdownItem
              img={export_icon}
              text={'Export'}
              onClick={() => {
                handleExport();
              }}
            />
            <DropdownItem
              img={save_icon}
              text={'Save'}
              onClick={() => {
                handleSave();
              }}
            />
            <DropdownItem
              img={info_icon}
              text={'Info'}
              onClick={() => {
                handleInfo();
              }}
            />
            <DropdownItem
              img={live_icon}
              text={'Share'}
              onClick={() => {
                handleShare();
              }}
            />
            <DropdownItem
              img={reset_icon}
              text={'Reset'}
              onClick={() => {
                handleReset();
              }}
            />
            <DropdownItem
              img={canvasStyle_icon}
              text={'Edit Canvas'}
              onClick={() => {
                handleStyle();
              }}
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

function DropdownItem(props: unknown) {
  return (
    <li className="dropdownItem" onClick={props.onClick}>
      <img src={props.img} alt=""></img>
      <a>{props.text}</a>
    </li>
  );
}
