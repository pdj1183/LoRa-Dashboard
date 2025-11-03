import React, { useState, useEffect, useRef } from "react";

export default function HamburgerMenu({ demoMode, setDemoMode, apiUrl, setApiUrl }) {
  const [isOpen, setIsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState(apiUrl);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    setUrlInput(apiUrl);
  }, [apiUrl]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleDemoModeChange = (e) => {
    setDemoMode(e.target.checked);
  };

  const handleUrlChange = (e) => {
    setUrlInput(e.target.value);
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    setApiUrl(urlInput);
    setIsOpen(false);
  };

  return (
    <div className="hamburger-menu" ref={menuRef}>
      <button
        className="hamburger-button"
        onClick={handleToggle}
        aria-label="Menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
      {isOpen && (
        <div className="hamburger-dropdown">
          <label title="Demo Mode simulates live device data for testing purposes when no real devices are connected">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={handleDemoModeChange}
            />
            Demo Mode
          </label>
          <form onSubmit={handleUrlSubmit} className="url-input-form">
            <label>
              API URL
              <input
                type="text"
                value={urlInput}
                onChange={handleUrlChange}
                disabled={demoMode}
                placeholder="http://localhost:8001"
              />
            </label>
            <button type="submit" disabled={demoMode}>
              Update
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
