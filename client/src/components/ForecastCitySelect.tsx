import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ForecastCitySelectProps {
  cities: Array<{ cityCode: number; cityName: string }>;
  selectedCityCode: number | null;
  onCitySelect: (cityCode: number) => void;
  disabled?: boolean;
}

export const ForecastCitySelect: React.FC<ForecastCitySelectProps> = ({
  cities,
  selectedCityCode,
  onCitySelect,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedCity = cities.find((c) => c.cityCode === selectedCityCode);
  const selectedIndex = cities.findIndex((c) => c.cityCode === selectedCityCode);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  // Scroll focused option into view
  useEffect(() => {
    if (!isOpen || focusedIndex < 0 || !listRef.current) return;
    const option = listRef.current.children[focusedIndex] as HTMLElement | undefined;
    if (option) {
      option.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [disabled, selectedIndex]);

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  }, []);

  const selectCity = useCallback((cityCode: number) => {
    if (cityCode !== selectedCityCode) {
      onCitySelect(cityCode);
    }
    close();
  }, [selectedCityCode, onCitySelect, close]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        e.preventDefault();
        open();
        break;
      case 'ArrowUp':
        e.preventDefault();
        open();
        break;
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, cities.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(cities.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < cities.length) {
          selectCity(cities[focusedIndex].cityCode);
        }
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'Tab':
        close();
        break;
    }
  };

  return (
    <div className="forecast-select" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="forecast-select-trigger"
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="forecast-city-listbox"
        disabled={disabled}
      >
        <span className="forecast-select-label">
          {selectedCity ? selectedCity.cityName : 'Select city'}
        </span>
        <svg
          className={`forecast-select-chevron${isOpen ? ' open' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          id="forecast-city-listbox"
          ref={listRef}
          className="forecast-select-menu"
          aria-label="Select city for temperature forecast"
          onKeyDown={handleListKeyDown}
          tabIndex={-1}
        >
          {cities.map((city, index) => {
            const isSelected = city.cityCode === selectedCityCode;
            const isFocused = index === focusedIndex;
            return (
              <div
                key={city.cityCode}
                role="option"
                aria-selected={isSelected}
                className={
                  'forecast-select-option' +
                  (isSelected ? ' selected' : '') +
                  (isFocused ? ' focused' : '')
                }
                onClick={() => selectCity(city.cityCode)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <span>{city.cityName}</span>
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="forecast-select-check"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
